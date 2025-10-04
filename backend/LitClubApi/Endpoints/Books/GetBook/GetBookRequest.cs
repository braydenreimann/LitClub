using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.GetBook;

public class GetBookRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
}