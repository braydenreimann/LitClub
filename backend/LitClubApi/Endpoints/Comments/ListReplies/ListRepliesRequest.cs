using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Comments.ListReplies;

public sealed class ListRepliesRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromRoute(Name = "commentId")]
    public required string CommentId { get; init; }

    [FromQuery(Name = "pageSize")]
    public int PageSize { get; init; } = 20;

    [FromQuery(Name = "continuationToken")]
    public string? ContinuationToken { get; init; }

    [FromQuery(Name = "userId")]
    public string? UserId { get; init; }
}