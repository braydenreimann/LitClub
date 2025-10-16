using Microsoft.AspNetCore.Mvc;
namespace LitClubApi.Endpoints.Libraries.LibraryBooks.GetLibraryBook;

public class GetLibraryBookRequest
{
    [FromRoute(Name = "ownerId")]
    public required string OwnerId { get; init; }
    [FromRoute(Name = "libraryBookId")]
    public required string LibraryBookId { get; init; }
}
