using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.ListLibraryBooks;

[ApiController]
public class List(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ListLibraryBooksRequest>
    .WithActionResult<ListLibraryBooksResponse>
{
    [HttpGet("libraries/{ownerId}/libraryBooks")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListLibraryBooksResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListLibraryBooksResponse>> HandleAsync(
        ListLibraryBooksRequest request,
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
        ListLibraryBooksResponse responseBody = new()
        {
            LibraryBooks = [.. library.LibraryBooks.Select(b => b.ToResponse())]
        };
        return Ok(responseBody);
    }
}
