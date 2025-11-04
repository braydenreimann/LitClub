using Ardalis.ApiEndpoints;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace LitClubApi.Endpoints.Threads.DeleteThread;

[ApiController]
public class Delete(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<DeleteThreadRequest>
    .WithActionResult
{
    [HttpDelete("threads/{threadId}", Name = "DeleteThread")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        DeleteThreadRequest request,
        CancellationToken cancellationToken = default)
    {
        var pk = new PartitionKey(request.ThreadId);

        try
        {
            await cosmosContext.Threads.PatchItemAsync<Domain.Thread>(
                id: request.ThreadId,
                partitionKey: pk,
                patchOperations:
                [
                    PatchOperation.Replace("/IsDeleted", true),
                    PatchOperation.Replace("/Updated", DateTime.UtcNow)
                ],
                cancellationToken: cancellationToken);

            return NoContent();
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