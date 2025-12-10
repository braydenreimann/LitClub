using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks
{
    public sealed class LibraryBookResponse
    {
        public required string Id { get; init; }
        public required string BookId { get; init; }
        public required ShelfStatus Status { get; init; }
        public DateOnly? StartedReading { get; init; }
        public DateOnly? FinishedReading { get; init; }
        public int? CurrentPage { get; init; }
        public int? PercentComplete { get; init; }
        public bool OnPedastal { get; init; }
        public bool[] CompletedChapters { get; set; } = [];
    }
}