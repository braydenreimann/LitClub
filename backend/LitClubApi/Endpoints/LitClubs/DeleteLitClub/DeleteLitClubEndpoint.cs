using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Libraries;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.DeleteLitClub;

[ApiController]
public class Delete(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<DeleteLitClubRequest>
    .WithActionResult
{
    [HttpDelete("litclubs/{litClubId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        DeleteLitClubRequest request,
        CancellationToken cancellationToken = default)
    {
        // Attempt to load the club to get library id (if any)
        LitClub? litClub = null;
        try
        {
            var read = await cosmosContext.LitClubs.ReadItemAsync<LitClub>(
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

        try
        {
            await cosmosContext.LitClubs.DeleteItemAsync<LitClub>(
                id: request.LitClubId,
                partitionKey: new PartitionKey(request.LitClubId),
                cancellationToken: cancellationToken);

            // If a library exists for this litclub, delete it too
            var libraryId = litClub?.LibraryId ?? request.LitClubId;
            try
            {
                await cosmosContext.Libraries.DeleteItemAsync<Library>(
                    id: libraryId,
                    partitionKey: new PartitionKey(libraryId),
                    cancellationToken: cancellationToken);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                // Library already absent; ignore
            }
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        return NoContent();
    }
}
