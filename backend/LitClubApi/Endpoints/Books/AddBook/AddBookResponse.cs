namespace LitClubApi.Endpoints.Books.AddBook;

public sealed class AddBookResponse
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string Author { get; init; }
    public required int TotalChapters { get; init; }
    public List<string> Genres { get; set; } = [];
    public string? Description { get; set; }
    public required List<AddEditionResponse> Editions { get; set; } = [];
}

public sealed class AddEditionResponse
{
    public required AddFormatResponse Format { get; init; }
    public required string Publisher { get; init; }
    public required DateOnly PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public required List<string> Isbn13s { get; init; } = [];
}

public enum AddFormatResponse
{
    Paperback,
    Hardcover,
    eBook
}