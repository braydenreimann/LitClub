using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class LitClubUser
{
    [JsonProperty(PropertyName = "id")]
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string UserName { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string? Bio { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public List<string> PreferredGenres { get; set; } = [];
    public bool PrivateAccount { get; set; } = false;
    public bool PublicInteractionRestricted { get; set; } = false;

    // Social connections
    public List<string> FollowingUserIds { get; set; } = [];
    public List<string> FollowerUserIds { get; set; } = [];
    public List<string> BlockedUserIds { get; set; } = [];

    // Book & club activity
    public List<string> LitClubIds { get; set; } = [];

    // Metadata
    public DateTime Created { get; init; } = DateTime.UtcNow;
}
