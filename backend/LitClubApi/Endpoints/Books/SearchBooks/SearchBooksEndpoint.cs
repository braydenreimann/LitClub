using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;

namespace LitClubApi.Endpoints.Books.SearchBooks;

[ApiController]
public class Search(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<SearchBooksRequest>
    .WithActionResult<IEnumerable<BookResponse>>
{
    [HttpGet("books/search", Name = "SearchBooks")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(IEnumerable<BookResponse>), StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<BookResponse>>> HandleAsync( //returns plain list of books instead of wrapper, easier to work with on client side
        SearchBooksRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Query))
                return Ok(Array.Empty<BookResponse>());

            string sql = @"
                SELECT c
                FROM c
                WHERE CONTAINS(LOWER(c.Title), LOWER(@query)) OR CONTAINS(LOWER(c.Author), LOWER(@query))
            "; //Simple substring matching, currently inefficient for large datasets due to partition key. 
               // Returns entire book object, instead of subset of fields, because I don't want to mess with Brayden's dark magic Mapper

            var query = new QueryDefinition(sql)
                .WithParameter("@query", request.Query);

            var iterator = cosmosContext.Books.GetItemQueryIterator<BookResponse>(query);

            var results = new List<BookResponse>();

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
