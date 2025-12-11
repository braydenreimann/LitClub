using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.EditLibraryBook;

[ApiController]
public class Edit(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditLibraryBookRequest>
    .WithActionResult<LibraryBookResponse>
{
    [HttpPatch("libraries/{userId}/libraryBooks/{libraryBookId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryBookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryBookResponse>> HandleAsync(
            EditLibraryBookRequest request,
            CancellationToken cancellationToken = default)
    {
        Library? library;
        var ownerId = request.OwnerId;
        try
        {
            var response = await cosmosContext.Libraries.ReadItemAsync<Library>(
                id: ownerId,
                partitionKey: new PartitionKey(ownerId),
                cancellationToken: cancellationToken);
            library = response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        var libraryBook = library.LibraryBooks.FirstOrDefault(lb => lb.Id == request.LibraryBookId);
        if (libraryBook is null)
        {
            return NotFound();
        }

        // Capture old status so we can detect transitions to CurrentlyReading
        var oldStatus = libraryBook.Status;

        var b = request.Body;
        if (b.Status.HasValue)
        {
            libraryBook.Status = b.Status.Value;
        }
        if (b.StartedReading.HasValue)
        {
            libraryBook.StartedReading = b.StartedReading;
        }
        if (b.FinishedReading.HasValue)
        {
            libraryBook.FinishedReading = b.FinishedReading;
        }
        if (b.CurrentPage.HasValue)
        {
            libraryBook.CurrentPage = b.CurrentPage;
        }
        if (b.PercentComplete.HasValue)
        {
            libraryBook.PercentComplete = b.PercentComplete;
        }
        if (b.OnPedastal.HasValue)
        {
            libraryBook.OnPedastal = b.OnPedastal.Value;
        }
        if (b.CompletedChapters is not null)
        {
            libraryBook.CompletedChapters = await NormalizeCompletedChaptersAsync(
                libraryBook.CompletedChapters,
                b.CompletedChapters,
                libraryBook.BookId,
                cosmosContext,
                cancellationToken);
        }

        await SeedLitClubChapterThreadsIfNeeded(
            cosmosContext,
            library,
            libraryBook,
            oldStatus,
            cancellationToken);

        try
        {
            await cosmosContext.Libraries.ReplaceItemAsync(
                item: library,
                id: library.OwnerId,
                partitionKey: new PartitionKey(library.OwnerId),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        return Ok(libraryBook.ToResponse());
    }

    private static async Task SeedLitClubChapterThreadsIfNeeded(
        ICosmosContext cosmosContext,
        Library library,
        LibraryBook libraryBook,
        ShelfStatus? oldStatus,
        CancellationToken cancellationToken)
    {
        // Only care about transitions TO CurrentlyReading
        if (oldStatus == ShelfStatus.currentlyReading) return;
        if (libraryBook.Status != ShelfStatus.currentlyReading) return;

        var ownerId = library.OwnerId;
        if (string.IsNullOrWhiteSpace(ownerId)) return;

        // Try to load a LitClub with this ownerId.
        // If it doesn't exist, this is a user library, not a club library.
        LitClub? litClub;
        try
        {
            var clubResp = await cosmosContext.LitClubs.ReadItemAsync<LitClub>(
                id: ownerId,
                partitionKey: new PartitionKey(ownerId),
                cancellationToken: cancellationToken);

            litClub = clubResp.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            // Not a LitClub library → nothing to seed.
            return;
        }
        catch (CosmosException)
        {
            // DB issue; don't block the main status update.
            return;
        }

        // Load the Book so we know chapter count and title.
        Book? book;
        try
        {
            var bookResp = await cosmosContext.Books.ReadItemAsync<Book>(
                id: libraryBook.BookId,
                partitionKey: new PartitionKey(libraryBook.BookId),
                cancellationToken: cancellationToken);

            book = bookResp.Resource;
        }
        catch (CosmosException)
        {
            return;
        }

        if (book.TotalChapters <= 0) return;

        var threadsContainer = cosmosContext.Threads;

        // Seed a LitClub-specific chapter thread for each chapter, but avoid duplicates.
        for (int chapterNumber = 1; chapterNumber <= book.TotalChapters; chapterNumber++)
        {
            var systemAuthor = new Author
            {
                AuthorId = "admin",
                Username = "LitClub Team"
            };

            // Use a deterministic thread ID to prevent duplicates across seeding operations.
            var deterministicThreadId = $"{book.Id}:{litClub.Id}:chapter:{chapterNumber}";

            var thread = new Domain.Thread
            {
                Id = deterministicThreadId,
                Author = systemAuthor,
                Title = $"Chapter {chapterNumber} Discussion",
                Body = $"Share your thoughts, reactions, and questions about Chapter {chapterNumber} of {book.Title} with other members of {litClub.Name} here.",
                BookId = book.Id,
                LitClubId = litClub.Id,
                ChapterNumber = chapterNumber
            };

            await threadsContainer.UpsertItemAsync(
                thread,
                new PartitionKey(thread.Id),
                cancellationToken: cancellationToken);
        }
    }

    private static async Task<bool[]> NormalizeCompletedChaptersAsync(
        bool[] current,
        bool[] incoming,
        string bookId,
        ICosmosContext cosmosContext,
        CancellationToken cancellationToken)
    {
        int totalChapters = 0;
        try
        {
            var bookResp = await cosmosContext.Books.ReadItemAsync<Book>(
                id: bookId,
                partitionKey: new Microsoft.Azure.Cosmos.PartitionKey(bookId),
                cancellationToken: cancellationToken);
            totalChapters = Math.Max(0, bookResp.Resource.TotalChapters);
        }
        catch
        {
            totalChapters = Math.Max(current?.Length ?? 0, incoming.Length);
        }

        if (totalChapters <= 0)
        {
            return incoming ?? Array.Empty<bool>();
        }

        var normalized = new bool[totalChapters];
        var source = incoming ?? Array.Empty<bool>();
        for (int i = 0; i < normalized.Length && i < source.Length; i++)
        {
            normalized[i] = source[i];
        }
        return normalized;
    }
}
