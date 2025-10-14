using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.CreateAccount;

[ApiController]
public class CreateAccount(Container usersContainer) : EndpointBaseAsync
    .WithRequest<CreateAccountRequest>
    .WithActionResult<UserResponse>
{
    [HttpPost("users/register")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<UserResponse>> HandleAsync(
        CreateAccountRequest request,
        CancellationToken cancellationToken = default)
    {
        QueryDefinition duplicateCheckQuery = new QueryDefinition(
            "SELECT TOP 1 * FROM c WHERE c.UserName = @userName OR c.Email = @Email")
            .WithParameter("@userName", request.UserName)
            .WithParameter("@Email", request.Email);

        FeedIterator<LitClubUser> duplicateCheck = usersContainer.GetItemQueryIterator<LitClubUser>(
            queryDefinition: duplicateCheckQuery,
            requestOptions: new QueryRequestOptions
            {
                MaxItemCount = 1
            });

        try
        {
            if (duplicateCheck.HasMoreResults)
            {
                FeedResponse<LitClubUser> firstPage = await duplicateCheck.ReadNextAsync(cancellationToken);
                if (firstPage.Any())
                {
                    return Conflict("An account with the same username or email already exists.");
                }
            }
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        LitClubUser user = UserMapper.ToDomain(request);

        try
        {
            await usersContainer.CreateItemAsync(
                item: user,
                partitionKey: new PartitionKey(user.Id),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        UserResponse response = user.ToResponse();

        return CreatedAtRoute("users", new { userId = response.Id }, response);
    }
}
