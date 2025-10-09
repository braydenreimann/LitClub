using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.EditBook;

public sealed class EditBookRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
    public string? Title { get; init; }
    public string? Author { get; init; }
    public int? TotalChapters { get; init; }
    public string? Genre { get; init; }
    public string? Description { get; init; }
}
