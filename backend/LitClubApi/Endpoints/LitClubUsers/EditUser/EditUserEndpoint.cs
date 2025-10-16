using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.EditUser;

[ApiController]
public class Edit(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditUserRequest>
    .WithActionResult<UserResponse>
{
    [HttpPatch("users/{userId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<UserResponse>> HandleAsync(
        EditUserRequest request,
        CancellationToken cancellationToken = default)
    {
        LitClubUser user;

        try
        {
            ItemResponse<LitClubUser> read = await cosmosContext.Users.ReadItemAsync<LitClubUser>(
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
                cancellationToken: cancellationToken);
            user = read.Resource;
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        UserMapper.ApplyUpdates(user, request);

        try
        {
            await cosmosContext.Users.ReplaceItemAsync(
                item: user,
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        UserResponse response = user.ToResponse();

        return Ok(response);
    }
}
