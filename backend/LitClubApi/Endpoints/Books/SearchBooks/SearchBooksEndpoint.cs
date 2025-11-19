using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;

namespace LitClubApi.Endpoints.Books.SearchBooks;

[ApiController]
public class Search(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<SearchBooksRequest>
    .WithActionResult<IEnumerable<BookSearchResponse>>
{
    [HttpGet("books/search", Name = "SearchBooks")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(IEnumerable<BookSearchResponse>), StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<BookSearchResponse>>> HandleAsync( //returns plain list of books instead of wrapper, easier to work with on client side
        SearchBooksRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Query))
                return Ok(Array.Empty<BookSearchResponse>());

            string sql = @"
                SELECT c.title, c.authors, c.bookId, c.coverImageUrl
                FROM c
                WHERE CONTAINS(LOWER(c.title), LOWER(@query))
            "; //Simple substring matching

            var query = new QueryDefinition(sql)
                .WithParameter("@query", request.Query);

            var iterator = cosmosContext.Books.GetItemQueryIterator<BookSearchResponse>(query);

            var results = new List<BookSearchResponse>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync(cancellationToken);
                results.AddRange(response);
            }

            return Ok(results);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to search database");
        }
    }
}
