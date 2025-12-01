/* begin Threads/ListThreads/ListThreadsEndpoint.cs */

using Ardalis.ApiEndpoints;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Threads.ListThreads;

[ApiController]
public class List(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ListThreadsRequest>
    .WithActionResult<ListThreadsResponse>
{
    [HttpGet("threads")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListThreadsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListThreadsResponse>> HandleAsync(
        ListThreadsRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // WHERE conditions + parameter bag
            var conditions = new List<string>
            {
                "c.itemType = 'thread'",
                "c.IsDeleted = false"
            };

            var parameters = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(request.BookId))
            {
                conditions.Add("c.BookId = @bookId");
                parameters["@bookId"] = request.BookId!;
            }

            if (!string.IsNullOrWhiteSpace(request.LitClubId))
            {
                conditions.Add("c.LitClubId = @litClubId");
                parameters["@litClubId"] = request.LitClubId!;
            }

            if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                conditions.Add("c.Author.AuthorId = @userId");
                parameters["@userId"] = request.UserId!;
            }

            if (request.AfterChapter.HasValue)
            {
                conditions.Add("c.AfterChapter = @afterChapter");
                parameters["@afterChapter"] = request.AfterChapter.Value;
            }

            var whereSql = conditions.Count > 0
                ? " WHERE " + string.Join(" AND ", conditions)
                : string.Empty;

            // ORDER BY
            var sort = (request.Sort ?? "new").Trim().ToLowerInvariant();
            var orderSql = sort == "top"
                ? " ORDER BY c.Score DESC, c.Created DESC"
                : " ORDER BY c.Created DESC";

            var sql = "SELECT * FROM c" + whereSql + orderSql;

            var queryDefinition = new QueryDefinition(sql);
            foreach (var kvp in parameters)
            {
                queryDefinition = queryDefinition.WithParameter(kvp.Key, kvp.Value);
            }

            // Page size defaults + cap
            var pageSize = request.PageSize ?? 20;
            if (pageSize <= 0) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            var options = new QueryRequestOptions
            {
                MaxItemCount = pageSize
                // Cross-partition is enabled automatically when no PK is supplied
            };

            var iterator = cosmosContext.Threads
                .GetItemQueryIterator<Domain.Thread>(
                    queryDefinition,
                    request.ContinuationToken,
                    options);

            var items = new List<ThreadResponse>();
            FeedResponse<Domain.Thread>? page = null;

            if (iterator.HasMoreResults)
            {
                page = await iterator.ReadNextAsync(cancellationToken);
                foreach (var t in page)
                {
                    if (!t.IsDeleted)
                        items.Add(t.ToResponse());
                }
            }

            return Ok(new ListThreadsResponse
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

/* end Threads/ListThreads/ListThreadsEndpoint.cs */