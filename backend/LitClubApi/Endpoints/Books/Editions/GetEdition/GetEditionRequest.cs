using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.Editions.GetEdition;

public sealed class GetEditionRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
    [FromRoute(Name = "editionId")]
    public required string EditionId { get; init; }
}
