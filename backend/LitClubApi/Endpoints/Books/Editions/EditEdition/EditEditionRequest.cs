using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Books.Editions.EditEdition;

public sealed class EditEditionRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }

    [FromRoute(Name = "editionId")]
    public required string EditionId { get; init; }

    [FromBody]
    public required EditEditionBody Body { get; init; }
}

public sealed class EditEditionBody
{
    public EditionFormatContract? Format { get; init; }
    public string? Publisher { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public List<string>? Isbn13s { get; init; }
}
