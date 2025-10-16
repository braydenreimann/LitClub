using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubUsers.ListUsers;

public sealed class ListUsersRequest
{
    private const int DefaultPageSize = 10;
    private const int MaxPageSize = 100;

    [FromQuery(Name = "pageSize")]
    public int PageSize { get; init; } = DefaultPageSize;

    [FromQuery(Name = "continuationToken")]
    public string? ContinuationToken { get; init; }

    public int ClampPageSize()
    {
        if (PageSize <= 0)
        {
            return DefaultPageSize;
        }

        return PageSize > MaxPageSize ? MaxPageSize : PageSize;
    }
}
