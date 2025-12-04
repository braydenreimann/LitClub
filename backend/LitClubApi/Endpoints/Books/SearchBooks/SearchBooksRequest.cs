using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.SearchBooks
{
    public class SearchBooksRequest
    {
        [FromQuery(Name = "query")]
        public string? Query { get; init; }
    }
}
