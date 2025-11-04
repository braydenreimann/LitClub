using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.Editions;

namespace LitClubApi.Endpoints.Books;

public static class BookMapper
{
    public static BookResponse ToResponse(this Book book) => new()
    {
        Id = book.Id,
        Title = book.Title,
        Author = book.Author,
        TotalChapters = book.TotalChapters,
        Genre = book.Genre,
        Description = book.Description,
        CoverImageUrl = book.CoverImageUrl,
        Editions = [.. book.Editions.Select(edition => edition.ToResponse())]
    };
}
