using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Books.AddBook;

public static class AddBookMapper
{
    public static Book ToDomain(this AddBookRequest request) => new()
    {
        Title = request.Title,
        Author = request.Author,
        TotalChapters = request.TotalChapters,
        Genres = request.Genres,
        Description = request.Description
    };
}
