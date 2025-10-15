using System.Linq;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.LitClubUsers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.ListUsers;

[ApiController]
public class List(Container usersContainer) : EndpointBaseAsync
    .WithRequest<ListUsersRequest>
    .WithActionResult<ListUsersResponse>
{
    [HttpGet("users")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListUsersResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListUsersResponse>> HandleAsync(
        ListUsersRequest request,
        CancellationToken cancellationToken = default)
    {
        int pageSize = request.ClampPageSize();

        FeedIterator<LitClubUser> iterator = usersContainer.GetItemQueryIterator<LitClubUser>(
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
                return Ok(new ListUsersResponse
                {
                    Users = [],
                    ContinuationToken = null
                });
            }

            FeedResponse<LitClubUser> page = await iterator.ReadNextAsync(cancellationToken);

            return Ok(new ListUsersResponse
            {
                Users = [.. page.Select(user => user.ToResponse())],
                ContinuationToken = page.ContinuationToken
            });
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
