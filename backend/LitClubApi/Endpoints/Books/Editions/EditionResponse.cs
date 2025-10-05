namespace LitClubApi.Endpoints.Books.Editions;

public sealed class EditionResponse
{
    public required string Id { get; init; }
    public required EditionFormatContract Format { get; init; }
    public required string Publisher { get; init; }
    public required DateOnly PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public required List<string> Isbn13s { get; init; } = [];
}
