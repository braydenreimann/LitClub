using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Thread = LitClubApi.Domain.Thread;

namespace LitClubApi.Endpoints.Votes.CastVote;

[ApiController]
public class ThreadVoteEndpoint(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ThreadVoteRequest>
    .WithActionResult<ThreadVoteResponse>
{
    [HttpPost("threads/{threadId}/vote")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ThreadVoteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ThreadVoteResponse>> HandleAsync(
        ThreadVoteRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Body.UserId))
            return BadRequest("UserId required.");

        var pk = new PartitionKey(request.ThreadId);
        var container = cosmosContext.Threads;

        // 1) Load thread
        Thread thread;
        try
        {
            var read = await container.ReadItemAsync<Thread>(
                request.ThreadId, pk, cancellationToken: cancellationToken);
            thread = read.Resource;
            // if you support soft-delete on threads, check and 404 here
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound();
        }

        // 2) Read prior vote (if any)
        var voteId = VoteIds.For(request.ThreadId, request.Body.UserId);
        ThreadVote? prior = null;
        string? priorEtag = null;

        try
        {
            var priorResp = await container.ReadItemAsync<ThreadVote>(
                voteId, pk, cancellationToken: cancellationToken);
            prior = priorResp.Resource;
            priorEtag = priorResp.ETag;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
        }

        var newVote = (sbyte)request.Body.Vote; // -1, 0, +1
        if (newVote is < -1 or > 1)
            return BadRequest("vote must be -1, 0, or 1");

        // 3) Persist the vote doc with optimistic concurrency (+retries)
        const int maxVoteRetries = 4;
        sbyte effectiveDelta = 0;
        for (var attempt = 0; attempt < maxVoteRetries; attempt++)
        {
            var oldVote = (sbyte)(prior?.Vote ?? 0);
            var delta = (sbyte)(newVote - oldVote);

            // idempotent: no change in vote, just return current score
            if (delta == 0)
            {
                var fresh = await container.ReadItemAsync<Thread>(
                    request.ThreadId, pk, cancellationToken: cancellationToken);

                return Ok(new ThreadVoteResponse
                {
                    ThreadId = request.ThreadId,
                    Score = fresh.Resource.Score,
                    UserVote = newVote
                });
            }

            try
            {
                if (prior is null)
                {
                    var newDoc = new ThreadVote
                    {
                        Id = voteId,
                        ThreadId = request.ThreadId,
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
                    prior.Vote = newVote;
                    prior.Updated = DateTime.UtcNow;
                    var replaceOpts = new ItemRequestOptions { IfMatchEtag = priorEtag };
                    await container.ReplaceItemAsync(prior, voteId, pk, replaceOpts, cancellationToken);
                }

                effectiveDelta = delta;
                break;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                // refresh & retry
                try
                {
                    var priorResp = await container.ReadItemAsync<ThreadVote>(
                        voteId, pk, cancellationToken: cancellationToken);
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

        // 4) If no effective delta, return latest score
        if (effectiveDelta == 0)
        {
            var fresh = await container.ReadItemAsync<Thread>(
                request.ThreadId, pk, cancellationToken: cancellationToken);
            return Ok(new ThreadVoteResponse
            {
                ThreadId = request.ThreadId,
                Score = fresh.Resource.Score,
                UserVote = newVote
            });
        }

        // 5) Apply delta to Thread.Score with Replace+IfMatch and retries
        const int maxScoreRetries = 5;
        for (var attempt = 0; attempt < maxScoreRetries; attempt++)
        {
            ItemResponse<Thread> read;
            try
            {
                read = await container.ReadItemAsync<Thread>(
                    request.ThreadId, pk, cancellationToken: cancellationToken);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return NotFound();
            }

            var doc = read.Resource;
            doc.Score = doc.Score + effectiveDelta;
            doc.Updated = DateTime.UtcNow;

            try
            {
                var opts = new ItemRequestOptions { IfMatchEtag = read.ETag };
                var replaced = await container.ReplaceItemAsync(
                    doc, request.ThreadId, pk, opts, cancellationToken);

                return Ok(new ThreadVoteResponse
                {
                    ThreadId = request.ThreadId,
                    Score = replaced.Resource.Score,
                    UserVote = newVote
                });
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                // thread was updated concurrently; retry with new base score
                continue;
            }
        }

        return StatusCode(500, "Failed to apply vote after retries.");
    }
}