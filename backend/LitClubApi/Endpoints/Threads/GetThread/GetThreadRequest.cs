/* begin Endpoints/Threads/GetThread/GetThreadRequest.cs */

using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Threads.GetThread;

public sealed class GetThreadRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }
}

/* end Endpoints/Threads/GetThread/GetThreadRequest.cs */