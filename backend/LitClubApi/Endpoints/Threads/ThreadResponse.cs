using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Threads;

public sealed class ThreadResponse
{
    public required string Id { get; init; }
    public required Author Author { get; init; }
    public string? Title { get; init; }
    public required string Body { get; init; }
    public string? BookId { get; init; }
    public int? ChapterNumber { get; init; }
    public int? AfterChapter { get; init; }
    public string? LitClubId { get; init; }
    public DateTime Created { get; init; }
    public DateTime? Updated { get; init; }
    public int CommentCount { get; init; }
    public int Score { get; init; }
    public bool IsDeleted { get; init; }
}