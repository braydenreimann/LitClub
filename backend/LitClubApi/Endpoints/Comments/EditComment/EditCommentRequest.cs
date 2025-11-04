using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Comments.EditComment;

public sealed class EditCommentRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromRoute(Name = "commentId")]
    public required string CommentId { get; init; }

    [FromBody]
    public required EditCommentBody Body { get; init; }
}

public sealed class EditCommentBody
{
    public string? Body { get; init; }
}