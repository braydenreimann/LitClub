namespace LitClubApi.Domain;

public static class VoteIds
{
    public static string For(string commentId, string userId) => $"vote:{commentId}:{userId}";
}