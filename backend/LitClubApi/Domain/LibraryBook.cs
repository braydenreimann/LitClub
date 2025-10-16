namespace LitClubApi.Domain
{
    public class LibraryBook
    {
        public string Id { get; init; } = Guid.NewGuid().ToString();
        public required string BookId { get; init; }
        public required ShelfStatus Status { get; set; }
        public DateOnly? StartedReading { get; set; }
        public DateOnly? FinishedReading { get; set; }
        public int? CurrentPage { get; set; }
        public int? PercentComplete { get; set; }
        public bool OnPedastal { get; set; }
    }
}
