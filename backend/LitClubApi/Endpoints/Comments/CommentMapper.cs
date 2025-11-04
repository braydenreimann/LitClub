using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Comments;

public static class CommentMapper
{
    public static CommentResponse ToResponse(this Comment c) => new()
    {
        Id = c.Id,
        ThreadId = c.ThreadId,
        Author = c.Author,
        Body = c.Body,
        ParentCommentId = c.ParentCommentId,
        Created = c.Created,
        Updated = c.Updated,
        Score = c.Score,
        IsDeleted = c.IsDeleted,
        ReplyCount = c.ReplyCount
    };
}