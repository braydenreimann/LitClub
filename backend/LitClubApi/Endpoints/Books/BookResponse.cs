using LitClubApi.Endpoints.Books.Editions;

namespace LitClubApi.Endpoints.Books;

public sealed class BookResponse
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Author { get; init; }
    public required int TotalChapters { get; init; }
    public required string Genre { get; init; }
    public string? Description { get; init; }
    public string? CoverImageUrl { get; init; }
    public List<EditionResponse> Editions { get; init; } = [];
    public List<string> ChapterThreadIds { get; set; } = [];
}
