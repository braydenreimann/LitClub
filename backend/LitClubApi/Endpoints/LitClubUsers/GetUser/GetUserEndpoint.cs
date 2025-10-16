using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.GetUser;

[ApiController]
public class Get(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<GetUserRequest>
    .WithActionResult<UserResponse>
{
    [HttpGet("users/{userId}", Name = "users")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<UserResponse>> HandleAsync(
        GetUserRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            ItemResponse<LitClubUser> read = await cosmosContext.Users.ReadItemAsync<LitClubUser>(
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
                cancellationToken: cancellationToken);

            UserResponse response = read.Resource.ToResponse();

            return Ok(response);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
