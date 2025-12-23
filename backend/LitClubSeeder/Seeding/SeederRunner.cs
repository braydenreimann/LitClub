using System.Collections.ObjectModel;
using System.Net;
using Azure.Storage.Blobs;
using LitClubApi.Configuration;
using LitClubApi.Domain;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace LitClubSeeder.Seeding;

public sealed class SeederRunner
{
    private readonly CosmosClient _cosmosClient;
    private readonly CosmosOptions _cosmosOptions;
    private readonly BlobContainerClient _blobContainerClient;
    private readonly ILogger<SeederRunner> _logger;
    private readonly string _dataRoot;

    public SeederRunner(
        CosmosClient cosmosClient,
        BlobContainerClient blobContainerClient,
        IOptions<CosmosOptions> cosmosOptions,
        ILogger<SeederRunner> logger)
    {
        _cosmosClient = cosmosClient;
        _blobContainerClient = blobContainerClient;
        _cosmosOptions = cosmosOptions.Value;
        _logger = logger;
        _dataRoot = Path.Combine(AppContext.BaseDirectory, "SeedData");
    }

    public async Task RunAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting LitClub data seeding.");

        await EnsureDatabaseAndContainersAsync(cancellationToken);
        await EnsureBlobContainerAsync(cancellationToken);

        var books = await SeedBooksAsync(cancellationToken);
        await SeedProfileImagesAsync(cancellationToken);

        await SeedThreads.SeedThreadsAsync(_cosmosClient, _cosmosOptions, books);
        await SeedUsers.SeedUsersAsync(_cosmosClient, _cosmosOptions, books);
        await SeedThreads.SeedTheFaultInOurStarsThreadAsync(_cosmosClient, _cosmosOptions);

        _logger.LogInformation("Seeding finished.");
    }

    private async Task EnsureDatabaseAndContainersAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Ensuring Cosmos DB '{Database}' and containers exist.", _cosmosOptions.DatabaseId);

        var dbResponse = await _cosmosClient.CreateDatabaseIfNotExistsAsync(
            _cosmosOptions.DatabaseId,
            throughput: 400,
            cancellationToken: cancellationToken);

        var database = dbResponse.Database;

        await database.CreateContainerIfNotExistsAsync(_cosmosOptions.BooksContainerId, "/id", cancellationToken: cancellationToken);
        await database.CreateContainerIfNotExistsAsync(_cosmosOptions.UsersContainerId, "/id", cancellationToken: cancellationToken);
        await database.CreateContainerIfNotExistsAsync(_cosmosOptions.LitClubsContainerId, "/id", cancellationToken: cancellationToken);
        await database.CreateContainerIfNotExistsAsync(_cosmosOptions.LibrariesContainerId, "/id", cancellationToken: cancellationToken);

        await RecreateThreadsContainerAsync(database, cancellationToken);
    }

    private async Task RecreateThreadsContainerAsync(Database database, CancellationToken cancellationToken)
    {
        try
        {
            await database
                .GetContainer(_cosmosOptions.ThreadsContainerId)
                .DeleteContainerAsync(cancellationToken: cancellationToken);

            _logger.LogInformation("Existing threads container deleted to apply indexing policy.");
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            // Container did not exist; nothing to clean up.
        }

        var props = new ContainerProperties
        {
            Id = _cosmosOptions.ThreadsContainerId,
            PartitionKeyPath = "/threadId",
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
        };

        await database.CreateContainerIfNotExistsAsync(props, cancellationToken: cancellationToken);
    }

    private async Task EnsureBlobContainerAsync(CancellationToken cancellationToken)
    {
        await _blobContainerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);
        _logger.LogInformation("Blob container '{ContainerName}' ready.", _blobContainerClient.Name);
    }

    private async Task<List<Book>> SeedBooksAsync(CancellationToken cancellationToken)
    {
        var csvPath = Path.Combine(_dataRoot, "Books", "bookdata.csv");
        var books = CSVParserInsert.Parse(csvPath);

        if (books.Count == 0)
        {
            _logger.LogWarning("No books parsed from {CsvPath}.", csvPath);
            return books;
        }

        var booksContainer = _cosmosClient.GetContainer(_cosmosOptions.DatabaseId, _cosmosOptions.BooksContainerId);

        foreach (var book in books)
        {
            cancellationToken.ThrowIfCancellationRequested();

            try
            {
                var existing = await booksContainer.ReadItemAsync<Book>(
                    book.Id,
                    new PartitionKey(book.Id),
                    cancellationToken: cancellationToken);

                if (existing.Resource.ChapterThreadIds is { Count: > 0 })
                {
                    book.ChapterThreadIds = existing.Resource.ChapterThreadIds;
                }
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                // First seed for this book; fall through to upsert.
            }

            await booksContainer.UpsertItemAsync(book, new PartitionKey(book.Id), cancellationToken: cancellationToken);

            if (string.IsNullOrWhiteSpace(book.CoverImageUrl))
            {
                _logger.LogWarning("Book '{Title}' missing cover image name; skipping upload.", book.Title);
                continue;
            }

            var coverPath = Path.Combine(_dataRoot, "Books", "BookCovers", book.CoverImageUrl);
            if (!File.Exists(coverPath))
            {
                _logger.LogWarning("Cover image for '{Title}' not found at {CoverPath}.", book.Title, coverPath);
                continue;
            }

            await UploadBlobAsync(coverPath, book.CoverImageUrl, cancellationToken);
        }

        _logger.LogInformation("Seeded {Count} books and uploaded covers.", books.Count);
        return books;
    }

    private async Task SeedProfileImagesAsync(CancellationToken cancellationToken)
    {
        var profileImages = new[]
        {
            "augustus.jpeg",
            "hank-green.jpg",
            "hazel.png",
            "hermione-granger.jpg",
            "john-green.png",
            "katniss-everdeen.jpg",
            "severus-snape.jpeg",
            "steve-jobs-headshot.jpg"
        };

        foreach (var image in profileImages)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var path = Path.Combine(_dataRoot, "Images", "Data", image);
            if (!File.Exists(path))
            {
                _logger.LogWarning("Profile image {Image} not found at {Path}.", image, path);
                continue;
            }

            await UploadBlobAsync(path, image, cancellationToken);
        }

        _logger.LogInformation("Uploaded profile images.");
    }

    private async Task UploadBlobAsync(string filePath, string blobName, CancellationToken cancellationToken)
    {
        var blobClient = _blobContainerClient.GetBlobClient(blobName);

        await using var stream = File.OpenRead(filePath);
        await blobClient.UploadAsync(stream, overwrite: true, cancellationToken: cancellationToken);
    }
}
