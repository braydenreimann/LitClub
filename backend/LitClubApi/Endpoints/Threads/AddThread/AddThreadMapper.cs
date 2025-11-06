namespace LitClubApi.Endpoints.Threads.AddThread;

public static class AddThreadMapper
{
    public static Domain.Thread ToDomain(AddThreadRequest req) => new()
    {
        Author = req.Author,
        Title = req.Title,
        Body = req.Body,
        BookId = req.BookId,
        ChapterNumber = req.ChapterNumber,
        LitClubId = req.LitClubId,
    };
}