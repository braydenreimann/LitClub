using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Comments.ListReplies;

[ApiController]
public class List(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ListRepliesRequest>
    .WithActionResult<ListRepliesResponse>
{
    [HttpGet("threads/{threadId}/comments/{commentId}/replies", Name = "ListReplies")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListRepliesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListRepliesResponse>> HandleAsync(
        ListRepliesRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var pk = new PartitionKey(request.ThreadId);

            var q = new QueryDefinition(@"
                SELECT * FROM c
                WHERE c.itemType = 'comment'
                  AND c.threadId = @t
                  AND c.ParentCommentId = @p
                  AND c.IsDeleted = false
                ORDER BY c.Score DESC, c.Created ASC")
                .WithParameter("@t", request.ThreadId)
                .WithParameter("@p", request.CommentId);

            var it = cosmosContext.Threads.GetItemQueryIterator<Comment>(
                q,
                request.ContinuationToken,
                new QueryRequestOptions { MaxItemCount = request.PageSize, PartitionKey = pk });

            var items = new List<CommentResponse>();
            FeedResponse<Comment>? page = null;

            if (it.HasMoreResults)
            {
                page = await it.ReadNextAsync(cancellationToken);

                var baseList = page.ToList();

                Dictionary<string, sbyte>? votesByCommentId = null;
                if (!string.IsNullOrWhiteSpace(request.UserId) && baseList.Count > 0)
                {
                    var votesQ = new QueryDefinition(@"
        SELECT * FROM c
        WHERE c.threadId = @t
          AND (
               (IS_DEFINED(c.userId) AND c.userId = @u)
            OR (IS_DEFINED(c.UserId) AND c.UserId = @u)
          )
          AND (
               (IS_DEFINED(c.itemType) AND c.itemType = 'commentVote')
            OR (IS_DEFINED(c.ItemType) AND c.ItemType = 'commentVote')
          )
          AND (IS_DEFINED(c.commentId) OR IS_DEFINED(c.CommentId))")
                        .WithParameter("@t", request.ThreadId)
                        .WithParameter("@u", request.UserId);

                    var voteIt = cosmosContext.Threads.GetItemQueryIterator<CommentVote>(
                        votesQ, null, new QueryRequestOptions { PartitionKey = pk });

                    votesByCommentId = new Dictionary<string, sbyte>(baseList.Count);
                    while (voteIt.HasMoreResults)
                    {
                        var votePage = await voteIt.ReadNextAsync(cancellationToken);
                        foreach (var v in votePage)
                        {
                            if (v is null) continue;

                            string? cid = v.CommentId;
                            if (string.IsNullOrWhiteSpace(cid)) continue; // skip non-comment vote docs defensively

                            sbyte vote = (sbyte)v.Vote;
                            // Keep the latest occurrence; duplicates shouldn't happen, but be robust.
                            votesByCommentId[cid] = vote;
                        }
                    }
                }

                foreach (var cmt in baseList)
                {
                    sbyte? uv = null;
                    if (votesByCommentId != null && votesByCommentId.TryGetValue(cmt.Id, out var v)) uv = v;

                    items.Add(new CommentResponse
                    {
                        Id = cmt.Id,
                        ThreadId = cmt.ThreadId,
                        Author = cmt.Author,
                        Body = cmt.Body,
                        ParentCommentId = cmt.ParentCommentId,
                        Created = cmt.Created,
                        Updated = cmt.Updated,
                        Score = cmt.Score,
                        IsDeleted = cmt.IsDeleted,
                        ReplyCount = cmt.ReplyCount,
                        UserVote = uv
                    });
                }
            }

            return Ok(new ListRepliesResponse
            {
                Items = items,
                ContinuationToken = page?.ContinuationToken
            });
        }
        catch (CosmosException ex)
        {
            Console.WriteLine($"[ListComments] Cosmos error {(int)ex.StatusCode} {ex.StatusCode}: {ex.Message}");
            return StatusCode(500, "Unable to access database");
        }
    }
}
