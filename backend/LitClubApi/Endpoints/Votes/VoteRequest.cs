using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Votes.CastVote;

public sealed class VoteRequest
{
    [FromRoute(Name = "threadId")]
    public required string ThreadId { get; init; }

    [FromRoute(Name = "commentId")]
    public required string CommentId { get; init; }

    [FromBody]
    public required VoteBody Body { get; init; }
}

public sealed class VoteBody
{
    public required VoteEnum Vote { get; init; }
}