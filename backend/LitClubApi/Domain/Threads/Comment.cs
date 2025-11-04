using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class Comment
{
    [JsonProperty(PropertyName = "id")]
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string ThreadId { get; init; }
    public required Author Author { get; init; }
    public required string Body { get; set; }
    public string? ParentCommentId { get; init; }
    public DateTime Created { get; init; } = DateTime.UtcNow;
    public DateTime? Updated { get; set; }
    public int Score { get; set; } = 0;
    public bool IsDeleted { get; set; } = false;
    public int ReplyCount { get; set; } = 0;
    public bool IsReply => !string.IsNullOrEmpty(ParentCommentId);
}