using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class LitClub
{
    [JsonProperty(PropertyName = "id")]
    public string Id { get; init; } = Guid.NewGuid().ToString()[..6];
    public required string Name { get; set; }
    public required string OwnerUserId { get; set; }
    public string? Description { get; set; }
    public List<string> PreferredGenres { get; set; } = [];
    public bool PrivateClub { get; set; } = true;

    // Members
    public List<string> MemberUserIds { get; set; } = [];
    public string? LibraryId { get; set; }

    // Metadata
    public DateTime Created { get; init; } = DateTime.UtcNow;
}