using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.ListLibraryBooks;

public sealed class ListLibraryBooksRequest
{
    [FromRoute(Name = "ownerId")]
    public required string OwnerId { get; init; }
}
