using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Books.AddBook;

public static class AddBookMapper
{
    public static Book ToDomain(this AddBookRequest request) => new()
    {
        Title = request.Title,
        Author = request.Author,
        TotalChapters = request.TotalChapters,
        Genre = request.Genre,
        Description = request.Description,
        CoverImageUrl = request.CoverImageUrl,
        ChapterThreadIds = request.ChapterThreadIds
    };
}
