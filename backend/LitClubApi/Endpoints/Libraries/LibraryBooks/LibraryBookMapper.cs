using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks
{
    public static class LibraryBookMapper
    {
        public static LibraryBookResponse ToResponse(this LibraryBook librarybook) => new()
        {
            Id = librarybook.Id,
            BookId = librarybook.BookId,
            Status = librarybook.Status,
            StartedReading = librarybook.StartedReading,
            FinishedReading = librarybook.FinishedReading,
            CurrentPage = librarybook.CurrentPage,
            PercentComplete = librarybook.PercentComplete,
            OnPedastal = librarybook.OnPedastal
        };
    }
}
