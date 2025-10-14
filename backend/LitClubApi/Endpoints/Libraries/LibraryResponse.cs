using LitClubApi.Domain

namespace LitClubApi.Endpoints.Libraries
{
    public sealed class LibraryResponse
    {
        public required string UserId { get; init; }
        public List<Library>
    }
}
