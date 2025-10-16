using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.EditLitClub;

[ApiController]
public class Edit(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditLitClubRequest>
    .WithActionResult<LitClubResponse>
{
    [HttpPatch("litclubs/{litClubId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LitClubResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LitClubResponse>> HandleAsync(
        EditLitClubRequest request,
        CancellationToken cancellationToken = default)
    {
        LitClub litClub;

        try
        {
            ItemResponse<LitClub> read = await cosmosContext.LitClubs.ReadItemAsync<LitClub>(
                id: request.LitClubId,
                partitionKey: new PartitionKey(request.LitClubId),
                cancellationToken: cancellationToken);
            litClub = read.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        LitClubMapper.ApplyUpdates(litClub, request.Body);

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

        return Ok(litClub.ToResponse());
    }
}
