namespace LitClubApi.Endpoints.LitClubs.ListLitClubs;

public sealed class ListLitClubsResponse
{
    public required List<LitClubResponse> LitClubs { get; init; } = [];
    public string? ContinuationToken { get; init; }
}
