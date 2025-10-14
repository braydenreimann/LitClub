namespace LitClubApi.Endpoints.LitClubUsers;

public sealed class UserResponse
{
    public required string Id { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string UserName { get; init; }
    public required string Email { get; init; }
    public string? Bio { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public List<string> PreferredGenres { get; init; } = [];
    public bool PrivateAccount { get; init; }
    public bool PublicInteractionRestricted { get; init; }
    public List<string> FollowingUserIds { get; init; } = [];
    public List<string> FollowerUserIds { get; init; } = [];
    public List<string> BlockedUserIds { get; init; } = [];
    public List<string> LitClubIds { get; init; } = [];
    public DateTime Created { get; init; }
}
