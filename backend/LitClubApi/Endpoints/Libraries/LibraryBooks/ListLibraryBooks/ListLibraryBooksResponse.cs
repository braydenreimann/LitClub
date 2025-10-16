namespace LitClubApi.Endpoints.Libraries.LibraryBooks.ListLibraryBooks;

public sealed class ListLibraryBooksResponse
{
    public required List<LibraryBookResponse> LibraryBooks { get; init; } = [];
}
