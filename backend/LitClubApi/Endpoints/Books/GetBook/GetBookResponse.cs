namespace LitClubApi.Endpoints.Books.GetBook;

public sealed class GetBookResponse
{
    public required string Title { get; init; }
    public required string Author { get; init; }
    public required int TotalChapters { get; init; }
    public List<string> Genres { get; set; } = [];
    public string? Description { get; set; }
    public required List<GetBookEditionResponse> Editions { get; set; } = [];
}

public sealed class GetBookEditionResponse
{
    public required GetBookFormatResponse Format { get; init; }
    public required string Publisher { get; init; }
    public required DateOnly PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public required List<string> Isbn13s { get; init; } = [];
}

public enum GetBookFormatResponse
{
    Paperback,
    Hardcover,
    eBook
}