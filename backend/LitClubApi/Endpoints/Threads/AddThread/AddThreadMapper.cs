namespace LitClubApi.Endpoints.Threads.AddThread;

public partial class Add
{
    private static class AddThreadMapper
    {
        public static Domain.Thread ToDomain(AddThreadRequest req) => new()
        {
            Author = req.Author,
            Title = req.Title,
            Body = req.Body,
            BookId = req.BookId,
            ChapterNumber = req.ChapterNumber,
            LitClubId = req.LitClubId,
            // Created, Id, and defaults are set by the domain model
        };

        public static ThreadDocument ToDocument(Domain.Thread t) => new()
        {
            Id = t.Id,
            ThreadId = t.Id,
            ItemType = "thread",
            Author = t.Author,
            Title = t.Title,
            Body = t.Body,
            BookId = t.BookId,
            ChapterNumber = t.ChapterNumber,
            LitClubId = t.LitClubId,
            Created = t.Created,
            Updated = t.Updated,
            CommentCount = t.CommentCount,
            Score = t.Score,
            IsDeleted = t.IsDeleted
        };
    }
}