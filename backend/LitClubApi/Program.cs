using Azure.Storage.Blobs; //dotnet add package Azure.Storage.Blobs in LitClubApi project folder
using LitClubApi.Configuration;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.Azure.Cosmos;
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
    var o = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;

    var clientOptions = new CosmosClientOptions
    {
        ConnectionMode = ConnectionMode.Gateway
    };
    if (builder.Environment.IsDevelopment())
    {
        // Disable TSL/SSL validation for development only
        clientOptions.HttpClientFactory = () => new HttpClient(new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        });
    }

    return new CosmosClient(o.Endpoint, o.PrimaryKey, clientOptions);
});

// Registered typed context
builder.Services.AddSingleton<ICosmosContext>(sp =>
{
    var client = sp.GetRequiredService<CosmosClient>();
    var opts = sp.GetRequiredService<IOptions<CosmosOptions>>();
    return new CosmosContext(client, opts);
});

// Blob options from configuration
builder.Services.Configure<BlobOptions>(
    builder.Configuration.GetSection("Blob")
);

// Register singleton BlobServiceClient
builder.Services.AddSingleton(sp =>
{
    var o = sp.GetRequiredService<IOptions<BlobOptions>>().Value;
    return new BlobServiceClient(o.ConnectionString);
});

// Register typed BlobContainerClient
builder.Services.AddSingleton(sp =>
{
    var blobService = sp.GetRequiredService<BlobServiceClient>();
    var opts = sp.GetRequiredService<IOptions<BlobOptions>>().Value;
    return blobService.GetBlobContainerClient(opts.ContainerName);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

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
