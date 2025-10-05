using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.DeleteBook;

public class Delete(Container booksContainer) : EndpointBaseAsync
    .WithRequest<DeleteBookRequest>
    .WithActionResult
{
    [HttpDelete("books/{bookId}")]
    public override async Task<ActionResult> HandleAsync(
        [FromRoute] DeleteBookRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await booksContainer.DeleteItemAsync<Book>(
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
