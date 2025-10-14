namespace LitClubApi.Endpoints.LitClubUsers;

public abstract class UserCreateRequestBase
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public required string UserName { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
    public string? Bio { get; init; }
    public string? ProfilePhotoUrl { get; init; }
    public List<string>? PreferredGenres { get; init; }
    public bool PrivateAccount { get; init; }
    public bool PublicInteractionRestricted { get; init; }
}
