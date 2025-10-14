using LitClubApi.Endpoints.LitClubUsers;

namespace LitClubApi.Endpoints.LitClubUsers.ListUsers;

public sealed class ListUsersResponse
{
    public required List<UserResponse> Users { get; init; } = [];
    public string? ContinuationToken { get; init; }
}
