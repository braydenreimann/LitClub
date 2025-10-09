namespace LitClubApi.Endpoints.Books.Editions.ListEditions;

public sealed class ListEditionsResponse
{
    public required List<EditionResponse> Editions { get; init; } = [];
}
