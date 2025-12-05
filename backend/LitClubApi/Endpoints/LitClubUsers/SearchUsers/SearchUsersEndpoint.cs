using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.SearchUsers;

[ApiController]
public class Search(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<SearchUsersRequest>
    .WithActionResult<IEnumerable<UserResponse>>
{
    [HttpGet("users/search", Name = "SearchUsers")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(IEnumerable<UserResponse>), StatusCodes.Status200OK)]
    public override async Task<ActionResult<IEnumerable<UserResponse>>> HandleAsync(
        SearchUsersRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Query))
                return Ok(Array.Empty<UserResponse>());

            string sql = @"
                SELECT *
                FROM c
                WHERE CONTAINS(LOWER(c.UserName), LOWER(@query)) OR CONTAINS(LOWER(c.FirstName), LOWER(@query)) OR CONTAINS(LOWER(c.LastName), LOWER(@query))
            ";

            var query = new QueryDefinition(sql)
                .WithParameter("@query", request.Query);

            var iterator = cosmosContext.Users.GetItemQueryIterator<LitClubUser>(query);
            var results = new List<UserResponse>();

            while (iterator.HasMoreResults)
            {
                var response = await iterator.ReadNextAsync(cancellationToken);
                results.AddRange(response.Select(u => u.ToResponse()));
            }

            return Ok(results);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to search database");
        }
    }
}
