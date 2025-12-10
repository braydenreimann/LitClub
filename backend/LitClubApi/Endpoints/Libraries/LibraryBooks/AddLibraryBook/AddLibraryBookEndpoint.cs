using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.AddLibraryBook;

[ApiController]
public class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<AddLibraryBookRequest>
    .WithActionResult<LibraryBookResponse>
{
    [HttpPost("libraries/{ownerId}/libraryBooks")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryBookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryBookResponse>> HandleAsync(
        AddLibraryBookRequest request,
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

        var b = request.Body;

        LibraryBook newLibraryBook = new()
        {
            BookId = b.BookId,
            Status = b.Status,
            StartedReading = b.StartedReading,
            FinishedReading = b.FinishedReading,
            CurrentPage = b.CurrentPage,
            PercentComplete = b.PercentComplete,
            OnPedastal = b.OnPedastal
        };

        library.LibraryBooks.Add(newLibraryBook);

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
        // Map the domain library book to a response
        LibraryBookResponse responseDto = newLibraryBook.ToResponse();
        return CreatedAtRoute("libraries", new { ownerId = library.OwnerId }, responseDto);
    }
}
