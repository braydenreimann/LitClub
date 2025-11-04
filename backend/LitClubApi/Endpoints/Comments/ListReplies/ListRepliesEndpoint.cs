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
            var q = new QueryDefinition(@"
                SELECT * FROM c
                WHERE c.itemType = 'comment'
                  AND c.threadId = @t
                  AND c.ParentCommentId = @p
                  AND c.IsDeleted = false
                  AND c.Score >= 0
                ORDER BY c.Score DESC, c.Created ASC")
                .WithParameter("@t", request.ThreadId)
                .WithParameter("@p", request.CommentId);

            var it = cosmosContext.Threads.GetItemQueryIterator<Comment>(
                q, request.ContinuationToken,
                new QueryRequestOptions { MaxItemCount = request.PageSize, PartitionKey = new PartitionKey(request.ThreadId) });

            var items = new List<CommentResponse>();
            FeedResponse<Comment>? page = null;

            if (it.HasMoreResults)
            {
                page = await it.ReadNextAsync(cancellationToken);
                foreach (var cmt in page) items.Add(cmt.ToResponse());
            }

            return Ok(new ListRepliesResponse
            {
                Items = items,
                ContinuationToken = page?.ContinuationToken
            });
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}