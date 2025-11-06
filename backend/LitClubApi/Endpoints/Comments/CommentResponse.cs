using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Comments;

public sealed class CommentResponse
{
    public required string Id { get; init; }
    public required string ThreadId { get; init; }
    public required Author Author { get; init; }
    public required string Body { get; init; }
    public string? ParentCommentId { get; init; }
    public DateTime Created { get; init; }
    public DateTime? Updated { get; init; }
    public int Score { get; init; }
    public bool IsDeleted { get; init; }
    public int ReplyCount { get; init; }
    public sbyte? UserVote { get; init; }
}