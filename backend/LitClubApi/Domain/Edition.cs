namespace LitClubApi.Domain;

public class Edition
{
    public required BookFormat Format { get; init; }
    public required string Publisher { get; init; }
    public required DateOnly PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public List<string> Isbn13s { get; init; } = [];
}