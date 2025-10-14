using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.LitClubUsers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.EditUser;

[ApiController]
public class Edit(Container usersContainer) : EndpointBaseAsync
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
            ItemResponse<LitClubUser> read = await usersContainer.ReadItemAsync<LitClubUser>(
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
            await usersContainer.ReplaceItemAsync(
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
