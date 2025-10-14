namespace LitClubApi.Domain
{
    public class LibraryBook
    {
        public required string isbn13 { get; set; }
        public required ShelfStatus Status { get; set; }
        public DateOnly? StartedReading { get; set; }
        public DateOnly? FinishedReading { get; set; }
        public int? Currentpage { get; set; }
        public int? PercentComplete { get; set; }
        public bool OnPedastal { get; set; }
    }
}
