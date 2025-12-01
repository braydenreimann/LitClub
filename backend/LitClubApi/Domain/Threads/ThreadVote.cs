using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class ThreadVote
{
    [JsonProperty(PropertyName = "id")]
    public required string Id { get; init; }      // e.g. "vote:{threadId}:{userId}"

    [JsonProperty(PropertyName = "threadId")]
    public required string ThreadId { get; init; }

    [JsonProperty(PropertyName = "itemType")]
    public string ItemType => "threadVote";

    public required string UserId { get; init; }
    public required sbyte Vote { get; set; }      // -1, 0, +1
    public DateTime Created { get; init; } = DateTime.UtcNow;
    public DateTime? Updated { get; set; }
}