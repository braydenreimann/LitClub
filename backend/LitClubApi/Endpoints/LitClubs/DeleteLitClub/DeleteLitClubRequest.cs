using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubs.DeleteLitClub;

public sealed class DeleteLitClubRequest
{
    [FromRoute(Name = "litClubId")]
    public required string LitClubId { get; init; }
}
