using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Votes.CastVote;

public sealed class ThreadVoteRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromBody]
    public required VoteBody Body { get; init; }  // same as comments
}