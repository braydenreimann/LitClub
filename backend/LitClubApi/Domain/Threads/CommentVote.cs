using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class CommentVote
{
    [JsonProperty(PropertyName = "id")]
    public required string Id { get; init; }      // "vote:{commentId}:{userId}"

    [JsonProperty(PropertyName = "threadId")]
    public required string ThreadId { get; init; }

    [JsonProperty(PropertyName = "itemType")]
    public string ItemType => "commentVote";

    public required string CommentId { get; init; }
    public required string UserId { get; init; }
    public required sbyte Vote { get; set; }      // -1, 0, +1
    public DateTime Created { get; init; } = DateTime.UtcNow;
    public DateTime? Updated { get; set; }
}