using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubs.GetLitClub;

public sealed class GetLitClubRequest
{
    [FromRoute(Name = "litClubId")]
    public required string LitClubId { get; init; }
}