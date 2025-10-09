namespace LitClubApi.Endpoints.Books.AddBook;

public sealed class AddBookRequest
{
    public required string Title { get; init; }
    public required string Author { get; init; }
    public required int TotalChapters { get; init; }
    public List<string> Genres { get; init; } = [];
    public string? Description { get; init; }
}