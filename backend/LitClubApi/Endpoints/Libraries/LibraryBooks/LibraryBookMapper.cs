using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks
{
    public static class LibraryBookMapper
    {
        public static LibraryBookResponse ToResponse(this LibraryBook librarybook) => new()
        {
            Isbn13 = librarybook.isbn13,
            ShelfStatus = librarybook.ShelfStatus.ToContract(),
            StartedReading = librarybook.StartedReading,
            FinishedReading = librarybook.FinishedReading,
            Currentpage = librarybook.Currentpage,
            PercentComplete = librarybook.PercentComplete,
            OnPedastal = librarybook.OnPedastal
        };

        public static ShelfStatusContract ToContract(this ShelfStatus status) => (ShelfStatusContract)status;

        public static ShelfStatus ToDomain(this ShelfStatusContract status) => (ShelfStatus)status;
    }
}
