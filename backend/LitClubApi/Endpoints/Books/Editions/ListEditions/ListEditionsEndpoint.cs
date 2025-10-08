using System.Net;
using System.Linq;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.Editions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;

namespace LitClubApi.Endpoints.Books.Editions.ListEditions;

public class List(Container booksContainer) : EndpointBaseAsync
    .WithRequest<ListEditionsRequest>
    .WithActionResult<ListEditionsResponse>
{
    [HttpGet("books/{bookId}/editions")]
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
