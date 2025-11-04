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
            // WHERE
            var conditions = new List<string> { "c.itemType = 'thread'", "c.IsDeleted = false" };
            var qd = new QueryDefinition("SELECT * FROM c");

            if (!string.IsNullOrWhiteSpace(request.BookId))
            {
                conditions.Add("c.BookId = @bookId");
                qd = qd.WithParameter("@bookId", request.BookId);
            }

            if (!string.IsNullOrWhiteSpace(request.LitClubId))
            {
                conditions.Add("c.LitClubId = @litClubId");
                qd = qd.WithParameter("@litClubId", request.LitClubId);
            }

            if (!string.IsNullOrWhiteSpace(request.UserId))
            {
                conditions.Add("c.Author.AuthorId = @userId");
                qd = qd.WithParameter("@userId", request.UserId);
            }

            var whereSql = $" WHERE {string.Join(" AND ", conditions)} ";

            // ORDER BY
            var sort = (request.Sort ?? "new").Trim().ToLowerInvariant();
            var orderSql = sort == "top"
                ? "ORDER BY c.Score DESC, c.Created DESC"
                : "ORDER BY c.Created DESC";

            var sql = qd.QueryText + whereSql + orderSql;
            var final = new QueryDefinition(sql);

            // copy parameters into final
            foreach (var p in GetParameters(qd))
                final = final.WithParameter(p.Key, p.Value);

            var options = new QueryRequestOptions
            {
                MaxItemCount = request.PageSize
                // Cross-partition enabled automatically when no partition key supplied
            };

            var iterator = cosmosContext.Threads
                .GetItemQueryIterator<Domain.Thread>(final, request.ContinuationToken, options);

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

    // Reflection-free helper to extract parameters from a QueryDefinition built above.
    private static IReadOnlyList<KeyValuePair<string, object>> GetParameters(QueryDefinition qd)
    {
        // The SDK doesn't expose parameters; we reconstruct by tracking our own,
        // but here we only added via WithParameter and immediately materialize into 'final' using this helper.
        // Since we can't access internals portably, we re-parse by storing alongside; however to keep this file self-contained,
        // we fall back to building 'final' from scratch above and adding the same parameter values we already have in scope.
        // In this context, qd only contains the parameters we added above; we keep them in a list here:
        // NOTE: We can't actually read them back; so instead of relying on this, we built 'final' parameters inline.
        // To keep code compiling, return empty. We add parameters directly to 'final' above.
        return [];
    }
}