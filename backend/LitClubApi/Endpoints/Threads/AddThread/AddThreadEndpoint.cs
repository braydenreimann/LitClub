using Ardalis.ApiEndpoints;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Threads.AddThread;

[ApiController]
public class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<AddThreadRequest>
    .WithActionResult<ThreadResponse>
{
    [HttpPost("threads", Name = "AddThread")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ThreadResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ThreadResponse>> HandleAsync(
        AddThreadRequest request,
        CancellationToken cancellationToken = default)
    {
        // Domain.Thread now serializes threadId (PK) and itemType automatically.
        var thread = new Domain.Thread
        {
            Author = request.Author,
            Title = request.Title,
            Body = request.Body,
            BookId = request.BookId,
            ChapterNumber = request.ChapterNumber,
            LitClubId = request.LitClubId
        };

        var pk = new PartitionKey(thread.ThreadId);
        try
        {
            await cosmosContext.Threads.CreateItemAsync(
                item: thread,
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