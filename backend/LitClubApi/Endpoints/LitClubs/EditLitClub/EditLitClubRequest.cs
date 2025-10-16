using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubs.EditLitClub;

public sealed class EditLitClubRequest
{
    [FromRoute(Name = "litClubId")]
    public required string LitClubId { get; init; }

    [FromBody]
    public required EditLitClubBody Body { get; init; }
}

public sealed class EditLitClubBody
{
    public string? Name { get; init; }
    public string? OwnerUserId { get; init; }
    public string? Description { get; init; }
    public List<string>? PreferredGenres { get; init; }
    public bool? PrivateClub { get; init; }
    public List<string>? MemberUserIds { get; init; }
    public string? LibraryId { get; init; }
}
