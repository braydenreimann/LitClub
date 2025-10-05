using LitClubApi.Endpoints.Books;

namespace LitClubApi.Endpoints.Books.ListBooks;

public sealed class ListBooksResponse
{
    public required List<BookResponse> Books { get; init; } = [];
    public string? ContinuationToken { get; init; }
}
