using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.GetLibraryBook;

[ApiController]
public class Get(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<GetLibraryBookRequest>
    .WithActionResult<LibraryBookResponse>
{
    [HttpGet("libraries/{ownerId}/libraryBooks/{libraryBookId}", Name = "library-book-get")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryBookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryBookResponse>> HandleAsync(
        [FromRoute] GetLibraryBookRequest request,
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
        return Ok(libraryBook.ToResponse());
    }
}
