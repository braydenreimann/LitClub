using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Libraries.AddLibrary
{
    public static class AddLibraryMapper
    {
        public static Library ToDomain(this AddLibraryRequest request) => new()
        {
            UserId = request.UserId,
        };
    }
}
