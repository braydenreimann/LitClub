using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.Editions.DeleteEdition;

public sealed class DeleteEditionRequest
{
    [FromRoute(Name = "bookId")]
    public required string BookId { get; init; }
    [FromRoute(Name = "editionId")]
    public required string EditionId { get; init; }
}