namespace LitClubApi.Endpoints.LitClubs;

public sealed class LitClubResponse
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string OwnerUserId { get; init; }
    public string? Description { get; init; }
    public IReadOnlyList<string> PreferredGenres { get; init; } = [];
    public bool PrivateClub { get; init; }
    public IReadOnlyList<string> MemberUserIds { get; init; } = [];
    public DateTime Created { get; init; }
}