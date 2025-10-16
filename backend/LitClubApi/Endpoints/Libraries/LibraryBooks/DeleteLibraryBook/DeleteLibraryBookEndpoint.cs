using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.DeleteLibraryBook;

public class Delete(ICosmosContext cosmosContext) : EndpointBaseAsync
        .WithRequest<DeleteLibraryBookRequest>
        .WithActionResult
{
    [HttpDelete("libraries/{ownerId}/libraryBooks/{libraryBookId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        [FromRoute] DeleteLibraryBookRequest request,
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
        library.LibraryBooks.Remove(libraryBook);
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
        return NoContent();
    }
}
