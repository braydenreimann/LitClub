namespace LitClubApi.Endpoints.Votes.CastVote;

public sealed class VoteResponse
{
    public required string CommentId { get; init; }
    public required int Score { get; init; }
    public required sbyte UserVote { get; init; } // -1, 0, +1
}