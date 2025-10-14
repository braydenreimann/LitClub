using System.Linq;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Libraries.LibraryBooks;

namespace LitClubApi.Endpoints.Libraries
{
    public static class LibraryMapper
    {
        public static LibraryResponse ToResponse(this Library library) => new()
        {
            UserId = library.UserId,
            LibraryBooks = [..library.LibraryBooks.Select(librarybook => librarybook.ToResponse())]
        };
    }
}
