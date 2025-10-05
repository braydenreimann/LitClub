using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.ListBooks;

public class List(Container booksContainer) : EndpointBaseAsync
    .WithRequest<ListBooksRequest>
    .WithActionResult<ListBooksResponse>
{
    [HttpGet("books")]
    public override async Task<ActionResult<ListBooksResponse>> HandleAsync(
        [FromQuery] ListBooksRequest request,
        CancellationToken cancellationToken = default)
    {
        int pageSize = request.ClampPageSize();

        FeedIterator<Book> iterator = booksContainer.GetItemQueryIterator<Book>(
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
