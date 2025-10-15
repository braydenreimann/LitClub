using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.AddLitClub;

[ApiController]
public class Add(Container litClubsContainer) : EndpointBaseAsync
    .WithRequest<AddLitClubRequest>
    .WithActionResult<LitClubResponse>
{
    [HttpPost("litclubs")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LitClubResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LitClubResponse>> HandleAsync(
        AddLitClubRequest request,
        CancellationToken cancellationToken = default)
    {
        LitClub litClub = LitClubMapper.ToDomain(request);
        var partitionKey = new PartitionKey(litClub.Id);

        try
        {
            await litClubsContainer.CreateItemAsync(
                item: litClub,
                partitionKey: partitionKey,
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        LitClubResponse response = litClub.ToResponse();

        return CreatedAtRoute("litclubs", new { litClubId = response.Id }, response);
    }
}
