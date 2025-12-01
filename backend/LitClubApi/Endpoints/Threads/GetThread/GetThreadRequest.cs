/* begin Endpoints/Threads/GetThread/GetThreadRequest.cs */

using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Threads.GetThread;

public sealed class GetThreadRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    // Optional: include the caller to receive their vote back in the response
    [FromQuery(Name = "userId")]
    public string? UserId { get; init; }
}

/* end Endpoints/Threads/GetThread/GetThreadRequest.cs */
