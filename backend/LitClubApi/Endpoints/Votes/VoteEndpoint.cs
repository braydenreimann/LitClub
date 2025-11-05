using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Votes.CastVote;

[ApiController]
public class Cast(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<VoteRequest>
    .WithActionResult<VoteResponse>
{
    [HttpPost("threads/{threadId}/comments/{commentId}/vote")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(VoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<VoteResponse>> HandleAsync(
        VoteRequest request,
        CancellationToken cancellationToken = default)
    {
        var pk = new PartitionKey(request.ThreadId);

        try
        {
            var read = await cosmosContext.Threads.ReadItemAsync<Comment>(
                id: request.CommentId,
                partitionKey: pk,
                cancellationToken: cancellationToken);

            var comment = read.Resource;
            if (comment.IsDeleted) return NotFound();

            comment.Score = comment.Score + (int)request.Body.Vote;
            comment.Updated = DateTime.UtcNow;

            var opts = new ItemRequestOptions { IfMatchEtag = read.ETag };
            await cosmosContext.Threads.ReplaceItemAsync(
                item: comment,
                id: request.CommentId,
                partitionKey: pk,
                requestOptions: opts,
                cancellationToken: cancellationToken);

            return Ok(new VoteResponse
            {
                CommentId = request.CommentId,
                Score = comment.Score
            });
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}