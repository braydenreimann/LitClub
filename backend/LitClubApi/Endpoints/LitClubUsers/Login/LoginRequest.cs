namespace LitClubApi.Endpoints.LitClubUsers.Login;

public sealed class LoginRequest
{
    public string? UserName { get; init; }
    public string? Email { get; init; }
    public required string Password { get; init; }

    public bool HasIdentifier() =>
        !string.IsNullOrWhiteSpace(UserName) || !string.IsNullOrWhiteSpace(Email);
}
