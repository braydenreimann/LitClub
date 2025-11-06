using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Threads.DeleteThread;

public sealed class DeleteThreadRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }
}