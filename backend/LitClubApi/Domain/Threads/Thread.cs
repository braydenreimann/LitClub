using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class Thread
{
    [JsonProperty(PropertyName = "id")]
    public string Id { get; init; } = Guid.NewGuid().ToString();

    // Cosmos PK expects /threadId; serialize a mirror of Id
    [JsonProperty(PropertyName = "threadId")]
    public string ThreadId => Id;

    // Discriminator for the shared container
    [JsonProperty(PropertyName = "itemType")]
    public string ItemType { get; } = "thread";

    public required Author Author { get; init; }
    public string? Title { get; set; }
    public required string Body { get; set; }
    public string? BookId { get; init; }
    public int? ChapterNumber { get; init; }
    public int? AfterChapter { get; init; }
    public string? LitClubId { get; init; }
    public DateTime Created { get; init; } = DateTime.UtcNow;
    public DateTime? Updated { get; set; }
    public int CommentCount { get; set; } = 0;
    public int Score { get; set; } = 0;
    public bool IsDeleted { get; set; } = false;

    public bool IsChapterThread => !string.IsNullOrWhiteSpace(BookId) && ChapterNumber.HasValue;
}