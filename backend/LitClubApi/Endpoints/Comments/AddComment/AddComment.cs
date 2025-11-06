using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Comments.AddComment;

[ApiController]
public class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<AddCommentRequest>
    .WithActionResult<CommentResponse>
{
    [HttpPost("threads/{threadId}/comments", Name = "AddComment")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(CommentResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<CommentResponse>> HandleAsync(
        AddCommentRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Body.Body))
            return BadRequest("Body is required.");

        var threadId = request.ThreadId;
        var parentId = string.IsNullOrWhiteSpace(request.Body.ParentCommentId) ? null : request.Body.ParentCommentId;
        var pk = new PartitionKey(threadId);

        // 1) Load thread (and ensure not deleted)
        Domain.Thread thread;
        ItemResponse<Domain.Thread> threadResp;
        try
        {
            threadResp = await cosmosContext.Threads.ReadItemAsync<Domain.Thread>(threadId, pk, cancellationToken: cancellationToken);
            thread = threadResp.Resource;
            if (thread.IsDeleted) return NotFound();
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return NotFound();
        }

        // 2) If replying, load parent and validate it's a top-level comment
        Comment? parent = null;
        ItemResponse<Comment>? parentResp = null;
        if (parentId is not null)
        {
            try
            {
                parentResp = await cosmosContext.Threads.ReadItemAsync<Comment>(parentId, pk, cancellationToken: cancellationToken);
                parent = parentResp.Resource;
                if (parent.IsDeleted || parent.ParentCommentId is not null)
                    return BadRequest("Invalid parentCommentId.");
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return BadRequest("Parent comment not found.");
            }
        }

        // 3) Create the new comment (Domain.Comment now has threadId + itemType)
        var comment = new Comment
        {
            ThreadId = threadId,
            Author = request.Body.Author,
            Body = request.Body.Body,
            ParentCommentId = parentId
        };

        try
        {
            await cosmosContext.Threads.CreateItemAsync(comment, pk, cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to create comment.");
        }

        // 4) Manually update thread counters with optimistic concurrency
        var threadUpdated = await ReplaceWithRetry<Domain.Thread>(
            container: cosmosContext.Threads,
            id: threadId,
            pk: pk,
            etag: threadResp.ETag,
            mutate: t =>
            {
                t.CommentCount++;
                t.Updated = DateTime.UtcNow;
            },
            cancellationToken: cancellationToken);

        if (!threadUpdated.ok)
        {
            return StatusCode(500, $"Failed to update thread counters after comment create. {threadUpdated.error}");
        }

        // 5) If reply, manually update parent reply count
        if (parent is not null && parentResp is not null)
        {
            var parentUpdated = await ReplaceWithRetry<Comment>(
                container: cosmosContext.Threads,
                id: parent.Id,
                pk: pk,
                etag: parentResp.ETag,
                mutate: p =>
                {
                    p.ReplyCount++;
                    p.Updated = DateTime.UtcNow;
                },
                cancellationToken: cancellationToken);

            if (!parentUpdated.ok)
            {
                return StatusCode(500, $"Comment created but failed to update parent counters. {parentUpdated.error}");
            }
        }

        return Created($"/threads/{threadId}/comments/{comment.Id}", comment.ToResponse());
    }

    private static async Task<(bool ok, string? error)> ReplaceWithRetry<T>(
        Container container,
        string id,
        PartitionKey pk,
        string etag,
        Action<T> mutate,
        CancellationToken cancellationToken) where T : class
    {
        const int maxRetries = 3;
        string? currentEtag = etag;

        for (int attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                var read = await container.ReadItemAsync<T>(id, pk, cancellationToken: cancellationToken);
                currentEtag = read.ETag;

                var doc = read.Resource!;
                mutate(doc);

                var opts = new ItemRequestOptions { IfMatchEtag = currentEtag };
                await container.ReplaceItemAsync(doc, id, pk, opts, cancellationToken);
                return (true, null);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                continue; // retry on ETag mismatch
            }
            catch (CosmosException ex)
            {
                return (false, $"Cosmos error: {ex.StatusCode}");
            }
        }

        return (false, "ETag precondition failed after retries.");
    }
}