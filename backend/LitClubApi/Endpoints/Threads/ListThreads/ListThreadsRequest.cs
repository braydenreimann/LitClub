using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Threads.ListThreads;

public sealed class ListThreadsRequest
{
    [FromQuery(Name = "bookId")]
    public string? BookId { get; init; }

    [FromQuery(Name = "litClubId")]
    public string? LitClubId { get; init; }

    [FromQuery(Name = "userId")]
    public string? UserId { get; init; }

    // "top" | "new" (default: new)
    [FromQuery(Name = "sort")]
    public string? Sort { get; init; }

    [FromQuery(Name = "pageSize")]
    public int PageSize { get; init; } = 20;

    // Cosmos continuation token
    [FromQuery(Name = "continuationToken")]
    public string? ContinuationToken { get; init; }
}