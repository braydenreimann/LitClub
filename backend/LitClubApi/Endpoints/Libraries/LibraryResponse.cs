using LitClubApi.Endpoints.Libraries.LibraryBooks;

namespace LitClubApi.Endpoints.Libraries;

public sealed class LibraryResponse
{
    public required string OwnerId { get; init; }
    public List<LibraryBookResponse> LibraryBooks { get; init; } = [];
}
