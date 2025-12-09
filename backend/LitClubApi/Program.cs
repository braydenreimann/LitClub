using Azure.Storage.Blobs; //dotnet add package Azure.Storage.Blobs in LitClubApi project folder
using LitClubApi.Configuration;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Blobs;
using LitClubApi.Endpoints.Books.AddBook;
using LitClubApi.Endpoints.LitClubs.AddLitClub;
using LitClubApi.Endpoints.LitClubUsers.AddUser;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;
using System.Collections.ObjectModel;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(opt =>
{
    opt.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LitClub API",
        Version = "v1",
        Description = "OpenAPI schema for LitClub"
    });
});

// Bind options from configuration
builder.Services.Configure<CosmosOptions>(
    builder.Configuration.GetSection("Cosmos")
);

// Register a singleton CosmosClient
builder.Services.AddSingleton(sp =>
{
    var env = sp.GetRequiredService<IHostEnvironment>();
    var o = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;

    var clientOptions = new CosmosClientOptions
    {
        // Disable TSL/SSL validation for development only
        HttpClientFactory = () => new HttpClient(new HttpClientHandler()
        {
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        }),
        ConnectionMode = ConnectionMode.Gateway
    };

    return new CosmosClient(o.Endpoint, o.PrimaryKey, clientOptions);
});

// Registered typed context
builder.Services.AddSingleton<ICosmosContext>(sp =>
{
    var client = sp.GetRequiredService<CosmosClient>();
    var opts = sp.GetRequiredService<IOptions<CosmosOptions>>();
    return new CosmosContext(client, opts);
});

//Blob is a seperate Azure service from Cosmos DB, therefore we need a seperate emulator for local use. That emulator is Azurite
//docker pull mcr.mircosoft.com/azure-storage/azurite
//docker run -p 10000:10000 -p 10001:10001 -p 10002:10002 --name azurite mcr.microsoft.com/azure-storage/azurite azurite-blob --blobHost 0.0.0.0 --blobPort 10000

//bind blob options from configuration
builder.Services.Configure<BlobOptions>(
    builder.Configuration.GetSection("Blob")
);

//register singleton BlobServiceClient
builder.Services.AddSingleton(sp =>
{
    var o = sp.GetRequiredService<IOptions<BlobOptions>>().Value;
    return new BlobServiceClient(o.ConnectionString);
});

//register typed BlobContainerClient
builder.Services.AddSingleton(sp =>
{
    var blobService = sp.GetRequiredService<BlobServiceClient>();
    var opts = sp.GetRequiredService<IOptions<BlobOptions>>().Value;
    return blobService.GetBlobContainerClient(opts.ContainerName);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHttpsRedirection();
}

// One-time initialization
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    var client = sp.GetRequiredService<CosmosClient>();
    var o = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;

    // Ensure DB and containers exist
    Database db = await client.CreateDatabaseIfNotExistsAsync(o.DatabaseId, throughput: 400); //If exception thrown, delete DB Emulator Image, and repeat instructions 4.2 and 4.3 from readme in terminal. Will fix the problem
    await db.CreateContainerIfNotExistsAsync(o.BooksContainerId, "/id");
    await db.CreateContainerIfNotExistsAsync(o.UsersContainerId, "/id");
    await db.CreateContainerIfNotExistsAsync(o.LitClubsContainerId, "/id");
    await db.CreateContainerIfNotExistsAsync(o.LibrariesContainerId, "/id");

    //Blob container setup
    var blobContainer = sp.GetRequiredService<BlobContainerClient>();
    await blobContainer.CreateIfNotExistsAsync(); //Syntax looks different from Cosmos setup because Blob Service only requires one container, and is not structured
                                                  // Images are set to public access for simplicity. Fix later by implementing SAS tokens.                                                   

    try
    {
        await db.GetContainer(o.ThreadsContainerId).DeleteContainerAsync();
    }
    catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
    {
        // ignore
    }

    await db.CreateContainerIfNotExistsAsync(new ContainerProperties
    {
        Id = o.ThreadsContainerId,                      // ← use options
        PartitionKeyPath = "/threadId",                 // partition key for both Thread and Comment
        IndexingPolicy = new IndexingPolicy
        {
            Automatic = true,
            IndexingMode = IndexingMode.Consistent,
            IncludedPaths = { new IncludedPath { Path = "/*" } },
            ExcludedPaths = { new ExcludedPath { Path = "/\"Body\"/?" } },
            CompositeIndexes =
        {
            new Collection<CompositePath>
            {
                new() { Path = "/threadId", Order = CompositePathSortOrder.Ascending },
                new() { Path = "/Score",    Order = CompositePathSortOrder.Descending },
                new() { Path = "/Created",  Order = CompositePathSortOrder.Ascending }
            }
        }
        }
    });

    // Optional: seed (dev-only is recommended)
    var books = client.GetContainer(o.DatabaseId, o.BooksContainerId);
    var users = client.GetContainer(o.DatabaseId, o.UsersContainerId);
    var clubs = client.GetContainer(o.DatabaseId, o.LitClubsContainerId);
    var libs = client.GetContainer(o.DatabaseId, o.LibrariesContainerId);
    var threads = client.GetContainer(o.DatabaseId, o.ThreadsContainerId);

    string basePath = AppContext.BaseDirectory; //Makes relative path to function on all machines
    string litClubFolder = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", ".."));
    string exist = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Books", "bookdata.csv");

    List<Book> booklist = CSVParserInsert.Parse(exist);

    foreach (Book b in booklist)
    {
        try
        {
            await books.UpsertItemAsync(b, new PartitionKey(b.Id));
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            // Item with same id already exists, skip
            continue;
        }

        string coverPathLoop = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Books", "BookCovers", $"{b.CoverImageUrl}");

        string blobNameLoop = $"{b.CoverImageUrl}";
        var blobClientLoop = blobContainer.GetBlobClient(blobNameLoop);

        using (var stream = File.OpenRead(coverPathLoop))
        {
            await blobClientLoop.UploadAsync(stream, overwrite: true);
        }

    }

    string coverPath = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Books", "BookCovers", "the-fault-in-our-stars.jpg");

    string blobName = "the-fault-in-our-stars.jpg";
    var blobClient = blobContainer.GetBlobClient(blobName);

    using (var stream = File.OpenRead(coverPath))
    {
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    coverPath = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Images", "Data", "John-Green.png"); //Default profile image for John Green

    blobName = "John-Green.png";
    blobClient = blobContainer.GetBlobClient(blobName);

    using (var stream = File.OpenRead(coverPath))
    {
        await blobClient.UploadAsync(stream, overwrite: true);
    }


    Book book = new()
    {
        Id = "99",
        Title = "The Fault in Our Stars",
        Author = "John Green",
        TotalChapters = 25,
        Genre = "Young adult novel",
        Description = "A book about two sick young lovers.",
        CoverImageUrl = "the-fault-in-our-stars.jpg",
        Editions =
        [
            new Edition
            {
                Format = BookFormat.Paperback,
                Publisher = "Penguin Books",
                PublicationDate = DateOnly.Parse("April 8, 2014"),
                PrintLength = 352,
                Isbn13s = ["978-0142424179"]
            }
        ],
        ChapterThreadIds =
        [
            "thread-1", "thread-2", "thread-3", "thread-4", "thread-5",
            "thread-6", "thread-7", "thread-8", "thread-9", "thread-10",
            "thread-11", "thread-12", "thread-13", "thread-14", "thread-15",
            "thread-16", "thread-17", "thread-18", "thread-19", "thread-20",
            "thread-21", "thread-22", "thread-23", "thread-24", "thread-25"
        ]
    };

    LitClubUser litClubUser = new()
    {
        Id = "1",
        FirstName = "John",
        LastName = "Green",
        UserName = "johngreen",
        Email = "johngreen@icloud.com",
        PasswordHash = "johngreenpw",
        Bio = "I'm just a Nerdfighter that loves reading and science",
        PreferredGenres = ["Fiction", "Science-Fiction", "Romance", "Drama", "Thriller"],
        ProfilePhotoUrl = "John-Green.png",
        LitClubIds = ["1"]
    };

    LitClubUser litClubUser2 = new()
    {
        Id = "2",
        FirstName = "Billy",
        LastName = "Wayne",
        UserName = "billywayne",
        Email = "billywayne@gmail.com",
        Bio = "I am a proud member of the LGBTQ+ community.",
        PreferredGenres = ["Non-Fiction", "Science", "Podcasts", "Comedy"],
        ProfilePhotoUrl = "John-Green.png",
        PasswordHash = "billywaynepw",
        LitClubIds = ["1"]
    };

    LitClub litClub = new()
    {
        Id = "litclub-1",
        Name = "Fans of John Green",
        OwnerUserId = "1",
        OwnerUserName = "johngreen",
        Description = "We love all of John Green's books. And some of Hank's too.",
        MemberUserIds = ["1"],
    };

    LitClub litClub2 = new()
    {
        Id = "litclub-2",
        Name = "Queer Literature Club",
        OwnerUserId = "2",
        OwnerUserName = "billywayne",
        Description = "Reading classical and contemporary literature through a queer lens.",
        MemberUserIds = ["1", "2"],
    };

    Library library = new()
    {
        OwnerId = "1",
        LibraryBooks =
        [
            new LibraryBook()
            {
                BookId = "1",
                Status = ShelfStatus.currentlyReading,
                StartedReading = DateOnly.Parse("October 11, 2025"),
                CurrentPage = 114,
                PercentComplete = 22,
                OnPedastal = false
            }
        ]
    };

    Library litClubLibrary = new()
    {
        OwnerId = "litclub-1",
        LibraryBooks =
        [
            new LibraryBook()
            {
                BookId = "1",
                Status = ShelfStatus.currentlyReading,
                StartedReading = DateOnly.Parse("October 11, 2025"),
                CurrentPage = 114,
                PercentComplete = 22,
                OnPedastal = false
            }
        ]
    };

    Library library2 = new()
    {
        OwnerId = "2",
        LibraryBooks =
        [
            new LibraryBook()
            {
                BookId = "1",
                Status = ShelfStatus.currentlyReading,
                StartedReading = DateOnly.Parse("October 11, 2025"),
                CurrentPage = 114,
                PercentComplete = 22,
                OnPedastal = false
            }
        ]
    };

    Author author = new()
    {
        AuthorId = "1",
        Username = "johngreen",
    };

    int i = 0;
    foreach (Book b in booklist) //Default profile booklist for testing purposes
    {
        ShelfStatus status = (ShelfStatus)(i % 5);
        DateOnly? started = null;
        DateOnly? finished = null;
        int currentpage = 0;
        bool pedestal = false;
        if (i % 8 == 0)
        {
            pedestal = true;
        }

        if (i % 4 == 0)
        {
            started = DateOnly.Parse("October 4, 2023");
            finished = DateOnly.Parse("October 10, 2023");
        }
        else if (i % 4 == 1 || i % 4 == 2)
        {
            started = DateOnly.Parse("October 11, 2023");
            currentpage = (b.Editions[0].PrintLength ?? 0) / 2;

        }
        LibraryBook lib = new LibraryBook()
        {
            BookId = b.Id,
            Status = status,
            StartedReading = started,
            FinishedReading = finished,
            CurrentPage = currentpage,
            PercentComplete = 50,
            OnPedastal = pedestal
        };
        library.LibraryBooks.Add(lib);
        i++;
    }

    await books.UpsertItemAsync(book, new PartitionKey(book.Id));
    await users.UpsertItemAsync(litClubUser, new PartitionKey(litClubUser.Id));
    await users.UpsertItemAsync(litClubUser2, new PartitionKey(litClubUser2.Id));
    await clubs.UpsertItemAsync(litClub, new PartitionKey(litClub.Id));
    await clubs.UpsertItemAsync(litClub2, new PartitionKey(litClub2.Id));
    await libs.UpsertItemAsync(library, new PartitionKey(library.OwnerId));
    await libs.UpsertItemAsync(library2, new PartitionKey(library2.OwnerId));
    await libs.UpsertItemAsync(litClubLibrary, new PartitionKey(litClubLibrary.OwnerId));

    await SeedThreads.SeedFaultInOurStarsForumAsync(client, o);
    await SeedUsers.SeedUsersAsync(client, o, booklist);

    //string usersCsvPath = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Users", "users.csv");
    //string litClubsCsvPath = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "LitClubs", "litclubs.csv");
    // --------------------
    // Seed Users
    // --------------------
    // var allUsers = new LitClubUser[]
    // {
    //     new() { Id="4", FirstName="Sofia", LastName="Hughes", UserName="sofghughes", Email="shughes@gmail.com", PasswordHash="sofghughespw", Bio="Hey!", PreferredGenres=new List<string>{"Fantasy","Romance"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="5", FirstName="firstever", LastName="user socool", UserName="socoolguy", Email="this@fake.com", PasswordHash="socoolguypw", Bio="Hi!", PreferredGenres=new List<string>{"Romance","Fiction"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="6", FirstName="Vidya", LastName="Madana", UserName="vidya", Email="vidya@fake.com", PasswordHash="vidyapw", Bio="Hello!", PreferredGenres=new List<string>{"Science-Fiction","Drama"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="7", FirstName="Kathleen", LastName="Lowe", UserName="katkit", Email="katkit@fake.com", PasswordHash="katkitpw", Bio="hiya", PreferredGenres=new List<string>{"Mystery","Non-Fiction"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="8", FirstName="Ben", LastName="Herrington", UserName="theben", Email="theben@fake.com", PasswordHash="thebenpw", Bio="how are you", PreferredGenres=new List<string>{"Drama","Thriller"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="9", FirstName="Brayden", LastName="Reimann", UserName="breimann", Email="breimann@fake.com", PasswordHash="breimannpw", Bio="bio", PreferredGenres=new List<string>{"Horror","Historical"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="10", FirstName="Domino", LastName="Pizza", UserName="pizzafan", Email="pizzafan@fake.com", PasswordHash="pizzafanpw", Bio="I love reading and science", PreferredGenres=new List<string>{"Fiction","Romance","Drama","Science-Fiction"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="11", FirstName="Pizza", LastName="Box", UserName="pepperoni", Email="pepperoni@fake.com", PasswordHash="pepperonipw", Bio="No bio provided", PreferredGenres=new List<string>{"Poetry","Young Adult"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="12", FirstName="Reader", LastName="Number 1", UserName="litclublover", Email="litclublover@fake.com", PasswordHash="litclubloverpw", Bio="No bio provided", PreferredGenres=new List<string>{"True Crime","Memoir"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="13", FirstName="Whale", LastName="Shark", UserName="whaleguy", Email="whaleguy@fake.com", PasswordHash="whaleguypw", Bio="No bio provided", PreferredGenres=new List<string>{"Historical","Poetry"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="14", FirstName="Crow", LastName="fella", UserName="crowfella", Email="crowfella@fake.com", PasswordHash="crowfellapw", Bio="No bio provided", PreferredGenres=new List<string>{"Romance","Mystery"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="15", FirstName="Kitty", LastName="Cat", UserName="justacat", Email="justacat@fake.com", PasswordHash="justacatpw", Bio="No bio provided", PreferredGenres=new List<string>{"Horror","Poetry"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="16", FirstName="Magician", LastName="Dude", UserName="foreveralone", Email="foreveralone@fake.com", PasswordHash="foreveralonepw", Bio="No bio provided", PreferredGenres=new List<string>{"Memoir","Romance"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="17", FirstName="barbie", LastName="doll", UserName="barbiegirl", Email="barbiegirl@fake.com", PasswordHash="barbiegirlpw", Bio="No bio provided", PreferredGenres=new List<string>{"Young Adult","Biography"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="18", FirstName="just", LastName="ken", UserName="justken", Email="justken@fake.com", PasswordHash="justkenpw", Bio="No bio provided", PreferredGenres=new List<string>{"Science","Western Fiction"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="19", FirstName="Star", LastName="Celestial", UserName="starrynight", Email="starrynight@fake.com", PasswordHash="starrynightpw", Bio="No bio provided", PreferredGenres=new List<string>{"Romance"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="20", FirstName="Dino", LastName="Luvr", UserName="t-rex", Email="t-rex@fake.com", PasswordHash="t-rexpw", Bio="No bio provided", PreferredGenres=new List<string>{"Drama","Thriller"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="21", FirstName="Weevil", LastName="Fan", UserName="bugfan", Email="bugfan@fake.com", PasswordHash="bugfanpw", Bio="No bio provided", PreferredGenres=new List<string>{"Mystery"}, ProfilePhotoUrl="John-Green.png" },
    //     new() { Id="22", FirstName="Alyssa", LastName="Collins", UserName="alyssa", Email="alyssa@fake.com", PasswordHash="alyssapw", Bio="No bio provided", PreferredGenres=new List<string>{"Poetry","Science Fiction"}, ProfilePhotoUrl="John-Green.png" }
    // };

    // foreach (var u in allUsers)
    // {
    //     try { await users.UpsertItemAsync(u, new PartitionKey(u.Id)); }
    //     catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict) { }
    // }

    // --------------------
    // Seed LitClubs
    // --------------------
    var allClubs = new LitClub[]
    {
        new() { Id="100001", Name="Queer Cosmic Reads", OwnerUserId="4", OwnerUserName="sofghughes", Description="A cozy, queer-friendly space exploring cosmic horror, sapphic space fantasies, and strange universes. Expect found-family themes and eldritch vibes.", PreferredGenres=new List<string>{"Horror","Science-Fiction","Fantasy"}, PrivateClub=false, MemberUserIds=new List<string>{"4","6","9","11","14","15","19","22"} },
        new() { Id="100002", Name="Cozy Blanket Book Nook", OwnerUserId="5", OwnerUserName="socoolguy", Description="A slow, gentle reading club for anyone who loves warm drinks, soft sweaters, and comforting slice-of-life novels. Perfect for readers who want to relax.", PreferredGenres=new List<string>{"Fiction","Romance","Young Adult"}, PrivateClub=false, MemberUserIds=new List<string>{"5","4","10","11","17","20","21","22"} },
        new() { Id="100003", Name="A24 Horror Society", OwnerUserId="6", OwnerUserName="vidya", Description="A club dedicated to eerie, stylish, and deeply unsettling horror—from A24 vibes to gothic dread. Psychological, atmospheric, always artistic.", PreferredGenres=new List<string>{"Horror","Thriller","Drama"}, PrivateClub=true, MemberUserIds=new List<string>{"6","8","9","15","20","13","21","22"} },
        new() { Id="100004", Name="Contemporary Poets Collective", OwnerUserId="7", OwnerUserName="katkit", Description="A gathering of poetry lovers who enjoy modern poets, emotional verse, and exploring the boundaries of language.", PreferredGenres=new List<string>{"Poetry","Drama","Non-Fiction"}, PrivateClub=false, MemberUserIds=new List<string>{"7","11","13","15","17","19","4","22"} },
        new() { Id="100005", Name="Chaotic Romance Enthusiasts", OwnerUserId="8", OwnerUserName="theben", Description="For readers who love dramatic, messy, heart-aching romance—whether it's swoony, toxic, or adorably wholesome.", PreferredGenres=new List<string>{"Romance","Fiction","Young Adult"}, PrivateClub=false, MemberUserIds=new List<string>{"8","4","5","14","16","17","19","22"} },
        new() { Id="100006", Name="True Crime After Dark", OwnerUserId="9", OwnerUserName="breimann", Description="A darker-lit club diving into true crime, memoirs, and psychological storytelling. Bring your theories and your moral dilemmas.", PreferredGenres=new List<string>{"True Crime","Memoir","Mystery"}, PrivateClub=true, MemberUserIds=new List<string>{"9","7","12","14","20","21","6","22"} },
        new() { Id="100007", Name="Stargazers", OwnerUserId="22", OwnerUserName="alyssa", Description="A space for sci-fi fans who adore starships, wormholes, robots, and wildly speculative futures.", PreferredGenres=new List<string>{"Science-Fiction","Science","Drama"}, PrivateClub=false, MemberUserIds=new List<string>{"10","6","18","4","11","13","20"} },
        new() { Id="100008", Name="Cottagecore Reading Circle", OwnerUserId="11", OwnerUserName="pepperoni", Description="A whimsical nature-loving club filled with soft fantasy, gentle adventures, herbal tea, and aesthetic story worlds.", PreferredGenres=new List<string>{"Fantasy","Young Adult","Romance"}, PrivateClub=false, MemberUserIds=new List<string>{"11","4","17","15","19","21","14","22"} }
    };

    foreach (var c in allClubs)
    {
        try
        {
            await clubs.UpsertItemAsync(c, new PartitionKey(c.Id));
            await libs.UpsertItemAsync(new Library { OwnerId = c.Id }, new PartitionKey(c.Id));
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.Conflict)
        {
            Console.WriteLine($"Club {c.Name} already exists, skipping.");
        }
    }

    Console.WriteLine("Seeding completed successfully.");

}

var updateSpec = args.Contains("--updateSpec");

// Generate a new OpenAPI spec document
if (updateSpec)
{
    Console.WriteLine("Generating a new OpenAPI schema...");

    using var scope = app.Services.CreateScope();
    var provider = scope.ServiceProvider.GetRequiredService<ISwaggerProvider>();
    var doc = provider.GetSwagger("v1");

    var schemaDir = Path.Combine(app.Environment.ContentRootPath, "schema");
    Directory.CreateDirectory(schemaDir);
    var outputPath = Path.Combine(schemaDir, "openapi.v1.json");

    // Serialize as OpenAPI 3.0 JSON
    var json = doc.Serialize(Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_0, Microsoft.OpenApi.OpenApiFormat.Json);
    await File.WriteAllTextAsync(outputPath, json, System.Text.Encoding.UTF8);

    Console.WriteLine($"OpenAPI schema successfully written to: {outputPath}");
}

app.UseAuthorization();

app.MapControllers();

app.Run();