using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Comments.DeleteComment;

public sealed class DeleteCommentRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromRoute(Name = "commentId")]
    public required string CommentId { get; init; }
}