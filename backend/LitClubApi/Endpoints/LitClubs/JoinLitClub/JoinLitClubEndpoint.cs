using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.JoinLitClub;

[ApiController]
public class Join(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<JoinLitClubRequest>
    .WithActionResult<LitClubResponse>
{
    [HttpPost("litclubs/{litClubId}/members")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LitClubResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LitClubResponse>> HandleAsync(
        JoinLitClubRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Body.UserId))
        {
            return BadRequest("A valid userId is required to join a LitClub.");
        }

        LitClub litClub;

        try
        {
            ItemResponse<LitClub> litClubResponse = await cosmosContext.LitClubs.ReadItemAsync<LitClub>(
                id: request.LitClubId,
                partitionKey: new PartitionKey(request.LitClubId),
                cancellationToken: cancellationToken);
            litClub = litClubResponse.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        LitClubUser user;

        try
        {
            ItemResponse<LitClubUser> userResponse = await cosmosContext.Users.ReadItemAsync<LitClubUser>(
                id: request.Body.UserId,
                partitionKey: new PartitionKey(request.Body.UserId),
                cancellationToken: cancellationToken);
            user = userResponse.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        bool litClubChanged = false;
        bool userChanged = false;

        if (!litClub.MemberUserIds.Contains(user.Id))
        {
            litClub.MemberUserIds.Add(user.Id);
            litClubChanged = true;
        }

        if (!user.LitClubIds.Contains(litClub.Id))
        {
            user.LitClubIds.Add(litClub.Id);
            userChanged = true;
        }

        if (!litClubChanged && !userChanged)
        {
            return Ok(litClub.ToResponse());
        }

        if (userChanged)
        {
            try
            {
                await cosmosContext.Users.ReplaceItemAsync(
                    item: user,
                    id: user.Id,
                    partitionKey: new PartitionKey(user.Id),
                    cancellationToken: cancellationToken);
            }
            catch (CosmosException)
            {
                return StatusCode(500, "Unable to access database");
            }
        }

        if (litClubChanged)
        {
            try
            {
                await cosmosContext.LitClubs.ReplaceItemAsync(
                    item: litClub,
                    id: litClub.Id,
                    partitionKey: new PartitionKey(litClub.Id),
                    cancellationToken: cancellationToken);
            }
            catch (CosmosException)
            {
                return StatusCode(500, "Unable to access database");
            }
        }

        return Ok(litClub.ToResponse());
    }
}
