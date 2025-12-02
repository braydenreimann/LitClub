using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.LeaveLitClub;

[ApiController]
public class Leave(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<LeaveLitClubRequest>
    .WithActionResult<LitClubResponse>
{
    [HttpDelete("litclubs/{litClubId}/members")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LitClubResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LitClubResponse>> HandleAsync(
        LeaveLitClubRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Body.UserId))
        {
            return BadRequest("A valid userId is required to leave a lit club.");
        }

        LitClub litClub;

        // ---- Load LitClub ----
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

        // ---- Load User ----
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

        // ---- Remove membership from LitClub ----
        if (litClub.MemberUserIds.Contains(user.Id))
        {
            // Assuming MemberUserIds is a List<string> in the domain model.
            litClub.MemberUserIds.Remove(user.Id);
            litClubChanged = true;
        }

        // ---- Remove LitClub from User ----
        if (user.LitClubIds.Contains(litClub.Id))
        {
            // Assuming LitClubIds is a List<string> in the domain model.
            user.LitClubIds.Remove(litClub.Id);
            userChanged = true;
        }

        // If nothing changed, just return current state
        if (!litClubChanged && !userChanged)
        {
            return Ok(litClub.ToResponse());
        }

        // ---- Persist user changes ----
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

        // ---- Persist lit club changes ----
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