using LitClubApi.Domain;
using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.AddLibraryBook;

public sealed class AddLibraryBookRequest
{
    [FromRoute(Name = "ownerId")]
    public required string OwnerId { get; init; }
    [FromBody]
    public required AddLibraryBookBody Body { get; init; }
}
public sealed class AddLibraryBookBody
{
    public required string BookId { get; init; }
    public required ShelfStatus Status { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? StartedReading { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? FinishedReading { get; init; }
    public int? CurrentPage { get; init; }
    public int? PercentComplete { get; init; }
    public bool OnPedastal { get; init; }
}