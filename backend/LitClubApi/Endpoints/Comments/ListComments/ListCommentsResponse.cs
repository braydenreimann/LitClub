namespace LitClubApi.Endpoints.Comments.ListComments;

public sealed class ListCommentsResponse
{
    public required List<CommentResponse> Items { get; init; }
    public string? ContinuationToken { get; init; }
}