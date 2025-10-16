using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubs.JoinLitClub;

public sealed class JoinLitClubRequest
{
    [FromRoute(Name = "litClubId")]
    public required string LitClubId { get; init; }

    [FromBody]
    public required JoinLitClubBody Body { get; init; }
}

public sealed class JoinLitClubBody
{
    public required string UserId { get; init; }
}
