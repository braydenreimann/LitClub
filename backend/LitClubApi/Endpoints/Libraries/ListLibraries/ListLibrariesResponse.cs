using LitClubApi.Endpoints.Libraries;

namespace LitClubApi.Endpoints.Libraries.ListLibraries
{
    public sealed class ListLibrariesResponse
    {
        public required List<LibraryResponse> Libraries { get; init; } = [];
        public string? ContinuationToken { get; init; }
    }
}
