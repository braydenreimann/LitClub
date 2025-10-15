using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.ListLibraryBooks;

public sealed class ListLibraryBooksRequest
{
    [FromRoute(Name = "userId")]
    public required string userId { get; init; }
}
