using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;

namespace LitClubApi.Endpoints.Books.SearchBooks;

[ApiController]
public class Search(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<SearchBooksRequest>
    .WithActionResult<IEnumerable<SearchBooksResponse>>
{
    [HttpGet("books/search", Name = "SearchBooks")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(IEnumerable<SearchBooksResponse>), StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<SearchBooksResponse>>> HandleAsync( //returns plain list of books instead of wrapper, easier to work with on client side
        SearchBooksRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Query))
                return Ok(Array.Empty<SearchBooksResponse>());

            string sql = @"
                SELECT c.id AS Id, c.Title AS Title, c.Author AS Author, c.CoverImageUrl AS CoverImageUrl
                FROM c
                WHERE CONTAINS(LOWER(c.Title), LOWER(@query))
            "; //Simple substring matching, currently inefficient for large datasets due to partition key.

            var query = new QueryDefinition(sql)
                .WithParameter("@query", request.Query);

            var iterator = cosmosContext.Books.GetItemQueryIterator<SearchBooksResponse>(query);

            var results = new List<SearchBooksResponse>();

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
