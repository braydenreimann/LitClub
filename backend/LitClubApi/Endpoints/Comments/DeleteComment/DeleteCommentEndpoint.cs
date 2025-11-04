using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using System.Net;

namespace LitClubApi.Endpoints.Comments.DeleteComment;

[ApiController]
public class Delete(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<DeleteCommentRequest>
    .WithActionResult
{
    [HttpDelete("threads/{threadId}/comments/{commentId}", Name = "DeleteComment")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        DeleteCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        var pk = new PartitionKey(request.ThreadId);

        try
        {
            await cosmosContext.Threads.PatchItemAsync<Comment>(
                id: request.CommentId,
                partitionKey: pk,
                patchOperations: new[]
                {
                    PatchOperation.Replace("/IsDeleted", true),
                    PatchOperation.Replace("/Updated", DateTime.UtcNow)
                },
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