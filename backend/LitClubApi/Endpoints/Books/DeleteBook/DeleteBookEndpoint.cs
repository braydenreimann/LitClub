using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.DeleteBook;

[ApiController]
public class Delete(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<DeleteBookRequest>
    .WithActionResult
{
    [HttpDelete("books/{bookId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        DeleteBookRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await cosmosContext.Books.DeleteItemAsync<Book>(
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        return NoContent();
    }
}
