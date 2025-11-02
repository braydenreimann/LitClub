using LitClubApi.Configuration;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.AddBook;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Extensions;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Swagger;

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

    // Optional: seed (dev-only is recommended)
    var books = client.GetContainer(o.DatabaseId, o.BooksContainerId);
    var users = client.GetContainer(o.DatabaseId, o.UsersContainerId);
    var clubs = client.GetContainer(o.DatabaseId, o.LitClubsContainerId);
    var libs = client.GetContainer(o.DatabaseId, o.LibrariesContainerId);

    string basePath = AppContext.BaseDirectory; //Makes relative path to function on all machines
    string litClubFolder = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", ".."));
    string exist = Path.Combine(litClubFolder, "LitClubApi", "bookdata", "bookdata.csv");

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
    }

    Book book = new()
    {
        Id = "1",
        Title = "The Fault in Our Stars",
        Author = "John Green",
        TotalChapters = 25,
        Genre = "Young adult novel",
        Description = "A book about two sick young lovers.",
        Editions = [
            new Edition {
                Format = BookFormat.Paperback,
                Publisher = "Penguin Books",
                PublicationDate = DateOnly.Parse("April 8, 2014"),
                PrintLength = 352,
                Isbn13s = ["978-0142424179"]
            }
        ],
        CoverImagePath = "the-fault-in-our-stars.jpg"
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
    };

    LitClub litClub = new()
    {
        Id = "1",
        Name = "Fans of John Green",
        OwnerUserId = "1",
        Description = "We love all of John Green's books. And some of Hank's too.",
        MemberUserIds = ["1"],
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

    int i = 0;
    foreach (Book b in booklist)
    {
        ShelfStatus status = (ShelfStatus)(i % 4);
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
    await clubs.UpsertItemAsync(litClub, new PartitionKey(litClub.Id));
    await libs.UpsertItemAsync(library, new PartitionKey(library.OwnerId));
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


var coversPath = Path.Combine(app.Environment.ContentRootPath, "bookdata", "BookCovers");

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(coversPath),
    RequestPath = "/covers"
});

app.UseAuthorization();

app.MapControllers();

app.Run();