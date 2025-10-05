using LitClubApi.Endpoints.Books.Editions;
using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Books.Editions.AddEdition;

public sealed class AddEditionRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
    public required EditionFormatContract Format { get; init; }
    public required string Publisher { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public required DateOnly PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public List<string> Isbn13s { get; init; } = [];
}
