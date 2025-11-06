using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Comments.AddComment;

public sealed class AddCommentRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromBody]
    public required AddCommentBody Body { get; init; }
}

public sealed class AddCommentBody
{
    public required Author Author { get; init; }
    public required string Body { get; init; }
    public string? ParentCommentId { get; init; }
}