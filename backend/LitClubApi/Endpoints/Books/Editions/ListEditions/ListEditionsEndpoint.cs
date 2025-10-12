using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.Editions.ListEditions;

[ApiController]
public class List(Container booksContainer) : EndpointBaseAsync
    .WithRequest<ListEditionsRequest>
    .WithActionResult<ListEditionsResponse>
{
    [HttpGet("books/{bookId}/editions")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListEditionsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListEditionsResponse>> HandleAsync(
        ListEditionsRequest request,
        CancellationToken cancellationToken = default)
    {
        Book? book;

        try
        {
            var response = await booksContainer.ReadItemAsync<Book>(
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken);
            book = response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        ListEditionsResponse responseBody = new()
        {
            Editions = [.. book.Editions.Select(e => e.ToResponse())]
        };

        return Ok(responseBody);
    }
}
