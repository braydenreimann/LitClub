using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubUsers.Login;

[ApiController]
public class Login(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<LoginRequest>
    .WithActionResult<UserResponse>
{
    [HttpPost("users/login")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(UserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<UserResponse>> HandleAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.HasIdentifier())
        {
            return BadRequest("Username or email is required.");
        }

        QueryDefinition query;

        if (!string.IsNullOrWhiteSpace(request.UserName))
        {
            query = new QueryDefinition("SELECT TOP 1 * FROM c WHERE c.UserName = @identifier")
                .WithParameter("@identifier", request.UserName);
        }
        else
        {
            query = new QueryDefinition("SELECT TOP 1 * FROM c WHERE c.Email = @identifier")
                .WithParameter("@identifier", request.Email);
        }

        FeedIterator<LitClubUser> iterator = cosmosContext.Users.GetItemQueryIterator<LitClubUser>(
            queryDefinition: query,
            requestOptions: new QueryRequestOptions
            {
                MaxItemCount = 1
            });

        LitClubUser? user = null;

        try
        {
            if (iterator.HasMoreResults)
            {
                FeedResponse<LitClubUser> page = await iterator.ReadNextAsync(cancellationToken);
                user = page.FirstOrDefault();
            }
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        if (user is null)
        {
            return Unauthorized();
        }

        bool passwordValid = PasswordHasher.VerifyPassword(request.Password, user.PasswordHash);

        if (!passwordValid)
        {
            return Unauthorized();
        }

        UserResponse response = user.ToResponse();

        return Ok(response);
    }
}
