using Azure.Storage.Blobs; //dotnet add package Azure.Storage.Blobs in LitClubApi project folder
using LitClubApi.Configuration;
using LitClubApi.Domain;
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

    var coverPath = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Images", "Data", "severus-snape.jpeg"); //Default profile image for John Green

    var blobName = "severus-snape.jpeg";
    var blobClient = blobContainer.GetBlobClient(blobName);

    using (var stream = File.OpenRead(coverPath))
    {
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    coverPath = Path.Combine(litClubFolder, "LitClubApi", "Seeder", "Images", "Data", "john-green.png"); //Default profile image for John Green

    blobName = "john-green.png";
    blobClient = blobContainer.GetBlobClient(blobName);

    using (var stream = File.OpenRead(coverPath))
    {
        await blobClient.UploadAsync(stream, overwrite: true);
    }

    await SeedThreads.SeedThreadsAsync(client, o, booklist);
    await SeedUsers.SeedUsersAsync(client, o, booklist);
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