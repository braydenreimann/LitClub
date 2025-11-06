using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.EditBook;

public sealed class EditBookRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }

    [FromBody]
    public required EditBookBody Body { get; init; }
}

public sealed class EditBookBody
{
    public string? Title { get; init; }
    public string? Author { get; init; }
    public int? TotalChapters { get; init; }
    public string? Genre { get; init; }
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public List<string>? ChapterThreadIds { get; init; }
}