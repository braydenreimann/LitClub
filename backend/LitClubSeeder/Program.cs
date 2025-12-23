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
    .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: false)
    .AddUserSecrets<Program>(optional: true)
    .AddEnvironmentVariables();

// Bind configuration with fail-fast validation
builder.Services
    .AddOptions<CosmosOptions>()
    .BindConfiguration("Cosmos")
    .Validate(ValidateCosmosOptions, "Cosmos configuration is required.")
    .ValidateOnStart();

builder.Services
    .AddOptions<BlobOptions>()
    .BindConfiguration("Blob")
    .Validate(ValidateBlobOptions, "Blob configuration is required.")
    .ValidateOnStart();

// Cosmos client
builder.Services.AddSingleton(sp =>
{
    var options = sp.GetRequiredService<IOptions<CosmosOptions>>().Value;
    var env = sp.GetRequiredService<IHostEnvironment>();

    var clientOptions = new CosmosClientOptions { ConnectionMode = ConnectionMode.Gateway };

    if (env.IsDevelopment())
    {
        clientOptions.HttpClientFactory = () => new HttpClient(new HttpClientHandler
        {
            ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
        });
    }

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
    await host.StartAsync(cts.Token);

    var runner = host.Services.GetRequiredService<SeederRunner>();
    await runner.RunAsync(cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Seeding cancelled.");
}
catch (OptionsValidationException ex)
{
    Console.Error.WriteLine("Configuration validation failed:");
    foreach (var failure in ex.Failures)
    {
        Console.Error.WriteLine($"- {failure}");
    }

    Environment.ExitCode = 1;
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

static bool ValidateCosmosOptions(CosmosOptions options) =>
    !string.IsNullOrWhiteSpace(options.Endpoint) &&
    !string.IsNullOrWhiteSpace(options.PrimaryKey) &&
    !string.IsNullOrWhiteSpace(options.DatabaseId) &&
    !string.IsNullOrWhiteSpace(options.BooksContainerId) &&
    !string.IsNullOrWhiteSpace(options.UsersContainerId) &&
    !string.IsNullOrWhiteSpace(options.LitClubsContainerId) &&
    !string.IsNullOrWhiteSpace(options.LibrariesContainerId) &&
    !string.IsNullOrWhiteSpace(options.ThreadsContainerId);

static bool ValidateBlobOptions(BlobOptions options) =>
    !string.IsNullOrWhiteSpace(options.ConnectionString) &&
    !string.IsNullOrWhiteSpace(options.ContainerName);
