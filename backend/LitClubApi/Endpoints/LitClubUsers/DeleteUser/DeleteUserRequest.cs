using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubUsers.DeleteUser;

public sealed class DeleteUserRequest
{
    [FromRoute(Name = "userId")]
    public required string UserId { get; init; }
}