using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Comments;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Newtonsoft.Json;

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

        // 3) Create the new comment document
        var comment = new Comment
        {
            ThreadId = threadId,
            Author = request.Body.Author,
            Body = request.Body.Body,
            ParentCommentId = parentId
        };

        var commentDoc = new CommentDocument
        {
            Id = comment.Id,
            ThreadId = comment.ThreadId,
            ItemType = "comment",
            Author = comment.Author,
            Body = comment.Body,
            ParentCommentId = comment.ParentCommentId,
            Created = comment.Created,
            Updated = comment.Updated,
            Score = comment.Score,
            IsDeleted = comment.IsDeleted,
            ReplyCount = comment.ReplyCount
        };

        try
        {
            await cosmosContext.Threads.CreateItemAsync(commentDoc, pk, cancellationToken: cancellationToken);
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
                t.CommentCount = t.CommentCount + 1;
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
                    p.ReplyCount = p.ReplyCount + 1;
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
                // Load latest (first attempt uses provided ETag to guard)
                ItemResponse<T> read;
                if (attempt == 0)
                {
                    // Try to mutate a local copy from the initial read by fetching again to ensure we have the object
                    read = await container.ReadItemAsync<T>(id, pk, cancellationToken: cancellationToken);
                    currentEtag = read.ETag;
                }
                else
                {
                    read = await container.ReadItemAsync<T>(id, pk, cancellationToken: cancellationToken);
                    currentEtag = read.ETag;
                }

                var doc = read.Resource!;
                mutate(doc);

                var opts = new ItemRequestOptions { IfMatchEtag = currentEtag };
                await container.ReplaceItemAsync(doc, id, pk, opts, cancellationToken);
                return (true, null);
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.PreconditionFailed)
            {
                // ETag mismatch → retry
                continue;
            }
            catch (CosmosException ex)
            {
                return (false, $"Cosmos error: {ex.StatusCode}");
            }
        }

        return (false, "ETag precondition failed after retries.");
    }

    private sealed class CommentDocument
    {
        [JsonProperty(PropertyName = "id")]
        public required string Id { get; init; }

        [JsonProperty(PropertyName = "threadId")]
        public required string ThreadId { get; init; }

        [JsonProperty(PropertyName = "itemType")]
        public string ItemType { get; init; } = "comment";

        public required Author Author { get; init; }
        public required string Body { get; init; }
        public string? ParentCommentId { get; init; }
        public DateTime Created { get; init; }
        public DateTime? Updated { get; init; }
        public int Score { get; init; }
        public bool IsDeleted { get; init; }
        public int ReplyCount { get; init; }
    }
}