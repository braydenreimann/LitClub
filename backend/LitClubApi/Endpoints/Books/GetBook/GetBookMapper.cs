using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Books.GetBook;

public static class GetBookMapper
{
    public static GetBookResponse ToResponse(this Book book) => new()
    {
        Title = book.Title,
        Author = book.Author,
        TotalChapters = book.TotalChapters,
        Genres = book.Genres,
        Description = book.Description,
        Editions = [.. book.Editions.Select(e => new GetBookEditionResponse
        {
            Format = (GetBookFormatResponse)e.Format,
            Publisher = e.Publisher,
            PublicationDate = e.PublicationDate,
            PrintLength = e.PrintLength,
            Isbn13s = e.Isbn13s
        })]
    };
}