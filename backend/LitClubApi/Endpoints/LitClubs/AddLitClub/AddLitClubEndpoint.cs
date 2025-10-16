using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.AddLitClub;

[ApiController]
public class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
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
            await cosmosContext.LitClubs.CreateItemAsync(
                item: litClub,
                partitionKey: partitionKey,
                cancellationToken: cancellationToken);

            // Create a new library for the LitClub
            Library library = new()
            {
                OwnerId = litClub.Id,
            };

            // Add the library to the libraries container
            await cosmosContext.LitClubs.CreateItemAsync(
                item: library,
                partitionKey: new PartitionKey(library.OwnerId),
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
