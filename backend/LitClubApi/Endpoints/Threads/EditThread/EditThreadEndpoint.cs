using Ardalis.ApiEndpoints;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace LitClubApi.Endpoints.Threads.EditThread;

[ApiController]
public class Edit(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditThreadRequest>
    .WithActionResult<ThreadResponse>
{
    [HttpPatch("threads/{threadId}", Name = "PatchThread")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ThreadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ThreadResponse>> HandleAsync(
        EditThreadRequest request,
        CancellationToken cancellationToken = default)
    {
        var hasTitle = request.Body.Title is not null;
        var hasBody = request.Body.Body is not null;
        if (!hasTitle && !hasBody) return BadRequest("No changes supplied.");

        var pk = new PartitionKey(request.ThreadId);
        var ops = new List<PatchOperation>();
        if (hasTitle) ops.Add(PatchOperation.Replace("/Title", request.Body.Title));
        if (hasBody) ops.Add(PatchOperation.Replace("/Body", request.Body.Body));
        ops.Add(PatchOperation.Replace("/Updated", DateTime.UtcNow));

        try
        {
            var resp = await cosmosContext.Threads.PatchItemAsync<Domain.Thread>(
                id: request.ThreadId,
                partitionKey: pk,
                patchOperations: ops,
                cancellationToken: cancellationToken);

            var updated = resp.Resource;
            if (updated.IsDeleted) return NotFound();

            return Ok(updated.ToResponse());
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