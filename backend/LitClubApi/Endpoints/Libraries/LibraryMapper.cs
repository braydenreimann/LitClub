using System.Linq;
using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Libraries
{
    public class LibraryMapper
    {
        public static LibraryResponse ToResponse(this Library library) => new()
        {
            UserId = library.UserId,
            Isbn13 = library.Isbn13,
            Status = library.Status,
            StartedReading = library.StartedReading,
            FinishedReading = library.FinishedReading,
            Currentpage = library.Currentpage,
            PercentComplete = library.PercentComplete,
            OnPedastal = library.OnPedastal
        };
    }
}
