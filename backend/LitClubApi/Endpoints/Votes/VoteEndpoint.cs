using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Votes.CastVote;

[ApiController]
public class Vote(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<VoteRequest>
    .WithActionResult<VoteResponse>
{
    [HttpPost("threads/{threadId}/comments/{commentId}/vote")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(VoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<VoteResponse>> HandleAsync(
   VoteRequest request,
   CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Body.UserId))
            return BadRequest("UserId required.");

        var pk = new PartitionKey(request.ThreadId);
        var container = cosmosContext.Threads; // must be the actual Cosmos Container

        // 1) Load comment
        Comment comment;
        try
        {
            var read = await container.ReadItemAsync<Comment>(request.CommentId, pk, cancellationToken: cancellationToken);
            comment = read.Resource;
            if (comment.IsDeleted) return NotFound();
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound();
        }

        // 2) Read prior vote (if any)
        var voteId = VoteIds.For(request.CommentId, request.Body.UserId);
        CommentVote? prior = null;
        string? priorEtag = null;

        try
        {
            var priorResp = await container.ReadItemAsync<CommentVote>(voteId, pk, cancellationToken: cancellationToken);
            prior = priorResp.Resource;
            priorEtag = priorResp.ETag;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
        }

        var newVote = (sbyte)request.Body.Vote; // -1, 0, +1
        if (newVote is < -1 or > 1) return BadRequest("vote must be -1, 0, or 1");

        // 3) Persist the vote doc with optimistic concurrency (+retries)
        //    Recompute delta each attempt based on latest stored value.
        const int maxVoteRetries = 4;
        sbyte effectiveDelta = 0;
        for (var attempt = 0; attempt < maxVoteRetries; attempt++)
        {
            var oldVote = (sbyte)(prior?.Vote ?? 0);
            var delta = (sbyte)(newVote - oldVote);

            // If no change is needed, we're done (idempotent)
            if (delta == 0)
            {
                var fresh = await container.ReadItemAsync<Comment>(request.CommentId, pk, cancellationToken: cancellationToken);
                return Ok(new VoteResponse { CommentId = request.CommentId, Score = fresh.Resource.Score, UserVote = newVote });
            }

            try
            {
                if (prior is null)
                {
                    // Create new vote (if none); if someone slipped in concurrently, 412 will be thrown
                    var newDoc = new CommentVote
                    {
                        Id = voteId,
                        ThreadId = request.ThreadId,
                        CommentId = request.CommentId,
                        UserId = request.Body.UserId,
                        Vote = newVote,
                        Created = DateTime.UtcNow,
                        Updated = null
                    };
                    var createOpts = new ItemRequestOptions { IfNoneMatchEtag = "*" };
                    await container.CreateItemAsync(newDoc, pk, createOpts, cancellationToken);
                }
                else
                {
                    // Replace existing vote with precondition
                    prior.Vote = newVote;
                    prior.Updated = DateTime.UtcNow;
                    var replaceOpts = new ItemRequestOptions { IfMatchEtag = priorEtag };
                    await container.ReplaceItemAsync(prior, voteId, pk, replaceOpts, cancellationToken);
                }

                // Persisted successfully; remember the delta we must apply to Comment.Score
                effectiveDelta = delta;
                break;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                // Refresh prior vote and retry
                try
                {
                    var priorResp = await container.ReadItemAsync<CommentVote>(voteId, pk, cancellationToken: cancellationToken);
                    prior = priorResp.Resource;
                    priorEtag = priorResp.ETag;
                    continue;
                }
                catch (CosmosException ex2) when (ex2.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    prior = null;
                    priorEtag = null;
                    continue;
                }
            }
        }

        // If effectiveDelta is still 0 here, prior loop returned early or converged to no-op
        if (effectiveDelta == 0)
        {
            var fresh = await container.ReadItemAsync<Comment>(request.CommentId, pk, cancellationToken: cancellationToken);
            return Ok(new VoteResponse { CommentId = request.CommentId, Score = fresh.Resource.Score, UserVote = newVote });
        }

        // 4) Apply delta to Comment.Score using Replace+IfMatch with retries
        const int maxScoreRetries = 5;
        for (var attempt = 0; attempt < maxScoreRetries; attempt++)
        {
            ItemResponse<Comment> read;
            try
            {
                read = await container.ReadItemAsync<Comment>(request.CommentId, pk, cancellationToken: cancellationToken);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound(); // comment disappeared between steps
            }

            var doc = read.Resource;
            doc.Score = doc.Score + effectiveDelta;
            doc.Updated = DateTime.UtcNow;

            try
            {
                var opts = new ItemRequestOptions { IfMatchEtag = read.ETag };
                var replaced = await container.ReplaceItemAsync(doc, request.CommentId, pk, opts, cancellationToken);
                return Ok(new VoteResponse
                {
                    CommentId = request.CommentId,
                    Score = replaced.Resource.Score,
                    UserVote = newVote
                });
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                // Someone else updated the comment; re-loop and apply the same delta on latest score
                continue;
            }
        }

        return StatusCode(500, "Failed to apply vote after retries.");
    }
}