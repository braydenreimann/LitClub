using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.DeleteLibraryBook;

public sealed class DeleteLibraryBookRequest
{
    [FromRoute(Name = "ownerId")]
    public required string OwnerId { get; init; }
    [FromRoute]
    public required string LibraryBookId { get; init; }
}