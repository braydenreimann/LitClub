using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.DeleteLibraryBook;

public class Delete(Container librariesContainer) : EndpointBaseAsync
        .WithRequest<DeleteLibraryBookRequest>
        .WithActionResult
{
    [HttpDelete("libraries/{UserId}/LibraryBooks/{Isbn13}")]
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
            var response = await librariesContainer.ReadItemAsync<Library>(
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
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
        var libraryBook = library.LibraryBooks.FirstOrDefault(lb => lb.Isbn13 == request.Isbn13);
        if (libraryBook is null)
        {
            return NotFound();
        }
        library.LibraryBooks.Remove(libraryBook);
        try
        {
            await librariesContainer.ReplaceItemAsync(
                item: library,
                id: library.UserId,
                partitionKey: new PartitionKey(library.UserId),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
        return NoContent();
    }
}
