using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Comments.ListComments;

public sealed class ListCommentsRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromQuery(Name = "pageSize")]
    public int PageSize { get; init; } = 20;

    [FromQuery(Name = "continuationToken")]
    public string? ContinuationToken { get; init; }
}