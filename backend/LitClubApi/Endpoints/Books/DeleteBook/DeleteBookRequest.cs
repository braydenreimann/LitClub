using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.DeleteBook;

public sealed class DeleteBookRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
}
