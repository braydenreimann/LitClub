using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.GetLitClub;

[ApiController]
public class Get(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<GetLitClubRequest>
    .WithActionResult<LitClubResponse>
{
    [HttpGet("litclubs/{litClubId}", Name = "litclubs")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LitClubResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LitClubResponse>> HandleAsync(
        GetLitClubRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            ItemResponse<LitClub> result = await cosmosContext.LitClubs.ReadItemAsync<LitClub>(
                id: request.LitClubId,
                partitionKey: new PartitionKey(request.LitClubId),
                cancellationToken: cancellationToken);

            return Ok(result.Resource.ToResponse());
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
