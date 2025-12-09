using LitClubApi.Domain;
using LitClubApi.Utilities;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.EditLibraryBook;

public sealed class EditLibraryBookRequest
{
    // Route template uses {userId}; bind that into OwnerId
    [FromRoute(Name = "userId")]
    public required string OwnerId { get; init; }
    [FromRoute(Name = "libraryBookId")]
    public required string LibraryBookId { get; init; }
    [FromBody]
    public required EditLibraryBookBody Body { get; init; }
}

public sealed class EditLibraryBookBody
{
    public ShelfStatus? Status { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? StartedReading { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public DateOnly? FinishedReading { get; init; }
    public int? CurrentPage { get; init; }
    public int? PercentComplete { get; init; }
    public bool? OnPedastal { get; init; }
}
