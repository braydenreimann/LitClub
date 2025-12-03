namespace LitClubApi.Endpoints.LitClubs.AddLitClub;

public sealed class AddLitClubRequest
{
    public required string Name { get; init; }
    public required string OwnerUserId { get; init; }
    public string? Description { get; init; }
    public List<string>? PreferredGenres { get; init; }
    public bool PrivateClub { get; init; }
}