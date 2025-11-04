using Ardalis.ApiEndpoints;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Threads.AddThread;

[ApiController]
public partial class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<AddThreadRequest>
    .WithActionResult<ThreadResponse>
{
    [HttpPost("threads")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ThreadResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ThreadResponse>> HandleAsync(
        AddThreadRequest request,
        CancellationToken cancellationToken = default)
    {
        // Map to domain
        Domain.Thread thread = AddThreadMapper.ToDomain(request);

        // Prepare persistence doc (adds threadId + itemType for the shared container)
        ThreadDocument doc = AddThreadMapper.ToDocument(thread);

        var pk = new PartitionKey(doc.ThreadId);

        try
        {
            await cosmosContext.Threads.CreateItemAsync(
                item: doc,
                partitionKey: pk,
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        // Return response (map from domain; domain & doc share values here)
        ThreadResponse response = thread.ToResponse();

        return CreatedAtRoute("threads", new { threadId = response.Id }, response);
    }
}