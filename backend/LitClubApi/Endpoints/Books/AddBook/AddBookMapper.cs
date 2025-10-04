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
        Description = request.Description,
        Editions = [.. request.Editions.Select(e => new Edition
        {
            Format = (BookFormat)e.Format,
            Publisher = e.Publisher,
            PublicationDate = e.PublicationDate,
            PrintLength = e.PrintLength,
            Isbn13s = e.Isbn13s
        })]
    };

    public static AddBookResponse ToResponse(this Book book) => new()
    {
        Id = book.Id,
        Title = book.Title,
        Author = book.Author,
        TotalChapters = book.TotalChapters,
        Genres = book.Genres,
        Description = book.Description,
        Editions = [.. book.Editions.Select(e => new AddEditionResponse
        {
            Format = (AddFormatResponse)e.Format,
            Publisher = e.Publisher,
            PublicationDate = e.PublicationDate,
            PrintLength = e.PrintLength,
            Isbn13s = e.Isbn13s
        })]
    };
}