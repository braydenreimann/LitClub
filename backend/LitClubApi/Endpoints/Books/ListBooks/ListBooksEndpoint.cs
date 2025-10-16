using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.ListBooks;

[ApiController]
public class List(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ListBooksRequest>
    .WithActionResult<ListBooksResponse>
{
    [HttpGet("books")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListBooksResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListBooksResponse>> HandleAsync(
        ListBooksRequest request,
        CancellationToken cancellationToken = default)
    {
        int pageSize = request.ClampPageSize();

        FeedIterator<Book> iterator = cosmosContext.Books.GetItemQueryIterator<Book>(
            queryDefinition: new QueryDefinition("SELECT * FROM c"),
            continuationToken: request.ContinuationToken,
            requestOptions: new QueryRequestOptions
            {
                MaxItemCount = pageSize
            });

        try
        {
            if (!iterator.HasMoreResults)
            {
                return Ok(new ListBooksResponse
                {
                    Books = [],
                    ContinuationToken = null
                });
            }

            FeedResponse<Book> page = await iterator.ReadNextAsync(cancellationToken);

            return Ok(new ListBooksResponse
            {
                Books = [.. page.Select(book => book.ToResponse())],
                ContinuationToken = page.ContinuationToken
            });
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
