using LitClubApi.Endpoints.Libraries.LibraryBooks;

namespace LitClubApi.Endpoints.Libraries;

public sealed class LibraryResponse
{
    public required string UserId { get; init; }
    public List<LibraryBookResponse> LibraryBooks { get; init; } = [];
}
