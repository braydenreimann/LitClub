using LitClubApi.Domain;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Threads.AddThread;

// Persistence shape for the shared "Threads" container
public sealed class ThreadDocument
{
    [JsonProperty(PropertyName = "id")]
    public required string Id { get; init; }

    [JsonProperty(PropertyName = "threadId")]
    public required string ThreadId { get; init; }

    [JsonProperty(PropertyName = "itemType")]
    public string ItemType { get; init; } = "thread";

    public required Author Author { get; init; }
    public string? Title { get; init; }
    public required string Body { get; init; }
    public string? BookId { get; init; }
    public int? ChapterNumber { get; init; }
    public string? LitClubId { get; init; }
    public DateTime Created { get; init; }
    public DateTime? Updated { get; init; }
    public int CommentCount { get; init; }
    public int Score { get; init; }
    public bool IsDeleted { get; init; }
}