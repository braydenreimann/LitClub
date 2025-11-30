using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Threads.AddThread;

public sealed class AddThreadRequest
{
    public required Author Author { get; init; }
    public string? Title { get; init; }
    public required string Body { get; init; }
    public string? BookId { get; init; }
    public int? ChapterNumber { get; init; }
    public string? LitClubId { get; init; }
    public int? AfterChapter { get; init; }
}