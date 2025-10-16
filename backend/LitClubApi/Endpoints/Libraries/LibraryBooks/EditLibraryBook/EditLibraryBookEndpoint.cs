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
        var libraryBook = library.LibraryBooks.FirstOrDefault(lb => lb.Id == request.LibraryBookId);
        if (libraryBook is null)
        {
            return NotFound();
        }

        var b = request.Body;
        if (b.Status.HasValue)
        {
            libraryBook.Status = b.Status.Value.ToDomain();
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
}
