using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubUsers.EditUser;

public sealed class EditUserRequest
{
    [FromRoute(Name = "userId")]
    public required string UserId { get; init; }

    [FromBody]
    public required EditUserBody Body { get; init; }
}

public sealed class EditUserBody
{
    public string? FirstName { get; init; }
    public string? LastName { get; init; }
    public string? UserName { get; init; }
    public string? Email { get; init; }
    public string? Password { get; init; }
    public string? Bio { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public List<string>? PreferredGenres { get; init; }
    public bool? PrivateAccount { get; init; }
    public bool? PublicInteractionRestricted { get; init; }
    public List<string>? FollowingUserIds { get; init; }
    public List<string>? FollowerUserIds { get; init; }
    public List<string>? BlockedUserIds { get; init; }
    public List<string>? LitClubIds { get; init; }
}