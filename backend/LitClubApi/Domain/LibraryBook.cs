namespace LitClubApi.Domain
{
    public class LibraryBook
    {
        public required string Isbn13 { get; set; }
        public required ShelfStatus Status { get; set; }
        public DateOnly? StartedReading { get; set; }
        public DateOnly? FinishedReading { get; set; }
        public int? CurrentPage { get; set; }
        public int? PercentComplete { get; set; }
        public bool OnPedastal { get; set; }
    }
}
