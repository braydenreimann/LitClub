using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Threads.EditThread;

public sealed class EditThreadRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromBody]
    public required EditThreadBody Body { get; init; }

}

public sealed class EditThreadBody
{
    public string? Title { get; init; }
    public string? Body { get; init; }
}