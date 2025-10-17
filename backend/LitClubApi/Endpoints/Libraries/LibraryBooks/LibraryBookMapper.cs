using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks
{
    public static class LibraryBookMapper
    {
        public static LibraryBookResponse ToResponse(this LibraryBook librarybook) => new()
        {
            Id = librarybook.BookId,
            Status = librarybook.Status.ToContract(),
            StartedReading = librarybook.StartedReading,
            FinishedReading = librarybook.FinishedReading,
            CurrentPage = librarybook.CurrentPage,
            PercentComplete = librarybook.PercentComplete,
            OnPedastal = librarybook.OnPedastal
        };

        public static ShelfStatusContract ToContract(this ShelfStatus status) => (ShelfStatusContract)status;

        public static ShelfStatus ToDomain(this ShelfStatusContract status) => (ShelfStatus)status;
    }
}
