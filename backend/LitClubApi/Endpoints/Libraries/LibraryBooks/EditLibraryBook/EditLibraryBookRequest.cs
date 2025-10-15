using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.EditLibraryBook;

public sealed class EditLibraryBookRequest
{
    [FromRoute(Name = "UserId")]
    public required string UserId { get; init; }
    [FromRoute(Name = "Isbn13")]
    public required string Isbn13 { get; init; }
    [FromBody]
    public required EditLibraryBookBody Body { get; init; }
}

public sealed class EditLibraryBookBody
{
    public ShelfStatusContract? Status { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? StartedReading { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? FinishedReading { get; init; }
    public int? CurrentPage { get; init; }
    public int? PercentComplete { get; init; }
    public bool? OnPedastal { get; init; }
}
