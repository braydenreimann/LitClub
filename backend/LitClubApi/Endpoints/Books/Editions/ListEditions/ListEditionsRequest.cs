using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.Editions.ListEditions;

public sealed class ListEditionsRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
}
