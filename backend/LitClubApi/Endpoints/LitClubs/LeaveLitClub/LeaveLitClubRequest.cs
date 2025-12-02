using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubs.LeaveLitClub;

public sealed class LeaveLitClubRequest
{
    [FromRoute(Name = "litClubId")]
    public required string LitClubId { get; init; }

    [FromBody]
    public required LeaveLitClubBody Body { get; init; }
}

public sealed class LeaveLitClubBody
{
    public required string UserId { get; init; }
}