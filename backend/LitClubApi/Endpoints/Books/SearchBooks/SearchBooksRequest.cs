namespace LitClubApi.Endpoints.Books.SearchBooks
{
    public class SearchBooksRequest
    {
        [FromRoute(Name = "bookId")]
        public required string BookId { get; init; }
    }
}
