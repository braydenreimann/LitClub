using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.ListBooks;

public sealed class ListBooksRequest
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