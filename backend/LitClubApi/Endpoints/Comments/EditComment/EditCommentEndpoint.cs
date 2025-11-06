using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace LitClubApi.Endpoints.Comments.EditComment;

[ApiController]
public class Edit(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditCommentRequest>
    .WithActionResult<CommentResponse>
{
    [HttpPatch("threads/{threadId}/comments/{commentId}", Name = "EditComment")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<CommentResponse>> HandleAsync(
        EditCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        var hasBody = request.Body.Body is not null;
        if (!hasBody) return BadRequest("No changes supplied.");

        var pk = new PartitionKey(request.ThreadId);
        var ops = new List<PatchOperation>
        {
            PatchOperation.Replace("/Body", request.Body.Body!),
            PatchOperation.Replace("/Updated", DateTime.UtcNow)
        };

        try
        {
            var resp = await cosmosContext.Threads.PatchItemAsync<Comment>(
                id: request.CommentId,
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