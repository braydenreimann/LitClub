using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubUsers.GetUser;

public sealed class GetUserRequest
{
    [FromRoute(Name = "userId")]
    public required string UserId { get; init; }
}
