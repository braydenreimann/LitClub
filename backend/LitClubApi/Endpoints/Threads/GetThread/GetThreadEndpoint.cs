using Ardalis.ApiEndpoints;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace LitClubApi.Endpoints.Threads.GetThread;

[ApiController]
public class Get(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<GetThreadRequest>
    .WithActionResult<ThreadResponse>
{
    [HttpGet("threads/{threadId}", Name = "threads")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ThreadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ThreadResponse>> HandleAsync(
        GetThreadRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var pk = new PartitionKey(request.ThreadId);

            // Read as domain model; extra persisted fields (threadId/itemType) are ignored.
            var resp = await cosmosContext.Threads.ReadItemAsync<Domain.Thread>(
                id: request.ThreadId,
                partitionKey: pk,
                cancellationToken: cancellationToken);

            var thread = resp.Resource;

            if (thread.IsDeleted)
                return NotFound();

            return Ok(thread.ToResponse());
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