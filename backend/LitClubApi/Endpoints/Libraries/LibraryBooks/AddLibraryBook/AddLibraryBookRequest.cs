using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.AddLibraryBook;

public sealed class AddLibraryBookRequest
{
    [FromRoute(Name = "UserId")]
    public required string UserId { get; init; }
    [FromBody]
    public required AddLibraryBookBody Body { get; init; }
}
public sealed class AddLibraryBookBody
{
    public required string Isbn13 { get; init; }
    public required ShelfStatusContract Status { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? StartedReading { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? FinishedReading { get; init; }
    public int? CurrentPage { get; init; }
    public int? PercentComplete { get; init; }
    public bool OnPedastal { get; init; }
}
