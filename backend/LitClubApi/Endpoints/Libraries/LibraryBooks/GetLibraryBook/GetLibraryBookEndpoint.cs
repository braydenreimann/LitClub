using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.GetLibraryBook;

[ApiController]
public class Get(Container librariesContainer) : EndpointBaseAsync
    .WithRequest<GetLibraryBookRequest>
    .WithActionResult<LibraryBookResponse>
{
    [HttpGet("libraries/{UserId}/librarybooks/{Isbn13}", Name = "library-book-get")]
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
        return Ok(libraryBook.ToResponse());
    }
}
