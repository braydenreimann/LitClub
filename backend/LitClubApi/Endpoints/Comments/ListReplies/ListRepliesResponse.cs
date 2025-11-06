namespace LitClubApi.Endpoints.Comments.ListReplies;

public sealed class ListRepliesResponse
{
    public required List<CommentResponse> Items { get; init; }
    public string? ContinuationToken { get; init; }
}