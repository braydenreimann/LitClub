/* begin Threads/ListThreads/ListThreadsRequest.cs */

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

    /// <summary>
    /// "new" (default) or "top"
    /// </summary>
    [FromQuery(Name = "sort")]
    public string? Sort { get; init; }

    /// <summary>
    /// Page size; defaults and caps are enforced in the endpoint.
    /// </summary>
    [FromQuery(Name = "pageSize")]
    public int? PageSize { get; init; }

    [FromQuery(Name = "continuationToken")]
    public string? ContinuationToken { get; init; }

    /// <summary>
    /// Only return threads whose AfterChapter equals this value.
    /// Used for per-chapter discussion lists.
    /// </summary>
    [FromQuery(Name = "afterChapter")]
    public int? AfterChapter { get; init; }
}

/* end Threads/ListThreads/ListThreadsRequest.cs */