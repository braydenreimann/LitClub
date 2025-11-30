namespace LitClubApi.Endpoints.Threads;

public static class ThreadMapper
{
    public static ThreadResponse ToResponse(this Domain.Thread thread) => new()
    {
        Id = thread.Id,
        Author = thread.Author,
        Title = thread.Title,
        Body = thread.Body,
        BookId = thread.BookId,
        ChapterNumber = thread.ChapterNumber,
        AfterChapter = thread.AfterChapter,
        LitClubId = thread.LitClubId,
        Created = thread.Created,
        Updated = thread.Updated,
        CommentCount = thread.CommentCount,
        Score = thread.Score,
        IsDeleted = thread.IsDeleted
    };
}