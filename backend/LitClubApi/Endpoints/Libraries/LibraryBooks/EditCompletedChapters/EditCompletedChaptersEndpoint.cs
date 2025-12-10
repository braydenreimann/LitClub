using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.EditCompletedChapters;

[ApiController]
public class EditCompletedChapters(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditCompletedChaptersRequest>
    .WithActionResult<LibraryBook>
{
    [HttpPatch("libraries/{ownerId}/libraryBooks/{libraryBookId}/completedChapters")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryBook), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryBook>> HandleAsync(
        EditCompletedChaptersRequest request,
        CancellationToken cancellationToken = default)
    {
        Library? library;
        try
        {
            var response = await cosmosContext.Libraries.ReadItemAsync<Library>(
                id: request.OwnerId,
                partitionKey: new PartitionKey(request.OwnerId),
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

        if (!string.Equals(library.OwnerId, request.OwnerId, StringComparison.Ordinal))
        {
            return Forbid();
        }

        var libraryBook = library.LibraryBooks.FirstOrDefault(lb => lb.Id == request.LibraryBookId);
        if (libraryBook is null)
        {
            return NotFound();
        }

        // Normalize completed chapters length to book.TotalChapters when possible
        var completed = request.Body.CompletedChapters ?? Array.Empty<bool>();
        try
        {
            var bookResp = await cosmosContext.Books.ReadItemAsync<Book>(
                id: libraryBook.BookId,
                partitionKey: new PartitionKey(libraryBook.BookId),
                cancellationToken: cancellationToken);

            var book = bookResp.Resource;
            var normalized = new bool[Math.Max(0, book.TotalChapters)];
            for (int i = 0; i < normalized.Length && i < completed.Length; i++)
            {
                normalized[i] = completed[i];
            }

            libraryBook.CompletedChapters = normalized;
        }
        catch (CosmosException)
        {
            // If we can't load the book, just persist what was sent.
            libraryBook.CompletedChapters = completed;
        }

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

        return Ok(libraryBook);
    }
}
