using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.DeleteLibraryBook;

public sealed class DeleteLibraryBookRequest
{
    [FromRoute(Name = "UserId")]
    public required string UserId { get; init; }
    [FromRoute(Name = "Isbn13")]
    public required string Isbn13 { get; init; }
}
