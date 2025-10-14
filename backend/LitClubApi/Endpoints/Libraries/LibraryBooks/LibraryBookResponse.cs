namespace LitClubApi.Endpoints.Libraries.LibraryBooks
{
    public sealed class LibraryBookResponse
    {
        public required string isbn13 { get; init; }
        public required ShelfStatusContract Status { get; init; }
        public DateOnly? StartedReading { get; init; }
        public DateOnly? FinishedReading { get; init; }
        public int? Currentpage { get; init; }
        public int? PercentComplete { get; init; }
        public bool OnPedastal { get; init; }
    }
}
