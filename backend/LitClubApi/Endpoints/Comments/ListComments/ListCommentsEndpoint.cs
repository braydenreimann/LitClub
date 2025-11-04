using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Comments.ListComments;

[ApiController]
public class List(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ListCommentsRequest>
    .WithActionResult<ListCommentsResponse>
{
    [HttpGet("threads/{threadId}/comments", Name = "ListComments")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListCommentsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListCommentsResponse>> HandleAsync(
        ListCommentsRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var q = new QueryDefinition(@"
                SELECT * FROM c
                WHERE c.itemType = 'comment'
                  AND c.threadId = @t
                  AND IS_NULL(c.ParentCommentId)
                  AND c.IsDeleted = false
                  AND c.Score >= 0
                ORDER BY c.Score DESC, c.Created ASC")
                .WithParameter("@t", request.ThreadId);

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

            return Ok(new ListCommentsResponse
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