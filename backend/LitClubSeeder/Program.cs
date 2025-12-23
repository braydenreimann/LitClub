using Azure.Storage.Blobs;
using LitClubApi.Configuration;
using LitClubSeeder.Seeding;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

// Anchor configuration to the seeder's directory so appsettings load regardless of working directory.
var builder = Host.CreateApplicationBuilder(new HostApplicationBuilderSettings
{
    Args = args,
    ContentRootPath = AppContext.BaseDirectory
});

builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
    .AddEnvironmentVariables();

// Bind configuration
builder.Services.Configure<CosmosOptions>(builder.Configuration.GetSection("Cosmos"));
builder.Services.Configure<BlobOptions>(builder.Configuration.GetSection("Blob"));

// Cosmos client
builder.Services.AddSingleton(sp =>
{
    var options = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;

    var clientOptions = new CosmosClientOptions
    {
        HttpClientFactory = () => new HttpClient(new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        }),
        ConnectionMode = ConnectionMode.Gateway
    };

    return new CosmosClient(options.Endpoint, options.PrimaryKey, clientOptions);
});

// Blob clients
builder.Services.AddSingleton(sp =>
{
    var blobOptions = sp.GetRequiredService<IOptions<BlobOptions>>().Value;
    return new BlobServiceClient(blobOptions.ConnectionString);
});

builder.Services.AddSingleton(sp =>
{
    var blobService = sp.GetRequiredService<BlobServiceClient>();
    var blobOptions = sp.GetRequiredService<IOptions<BlobOptions>>().Value;
    return blobService.GetBlobContainerClient(blobOptions.ContainerName);
});

builder.Services.AddSingleton<SeederRunner>();

using var host = builder.Build();
using var cts = new CancellationTokenSource();

Console.CancelKeyPress += (_, e) =>
{
    Console.WriteLine("Cancellation requested... stopping after current operation.");
    e.Cancel = true;
    cts.Cancel();
};

try
{
    var runner = host.Services.GetRequiredService<SeederRunner>();
    await runner.RunAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Seeding cancelled.");
}
catch (Exception ex)
{
    Console.Error.WriteLine($"Seeding failed: {ex.Message}");
    Console.Error.WriteLine(ex);
    Environment.ExitCode = 1;
}
finally
{
    await host.StopAsync();
}
