using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.EditCompletedChapters;

public sealed class EditCompletedChaptersRequest
{
    [FromRoute(Name = "ownerId"), Required]
    public required string OwnerId { get; init; }

    [FromRoute(Name = "libraryBookId"), Required]
    public required string LibraryBookId { get; init; }

    [FromBody, Required]
    public required EditCompletedChaptersBody Body { get; init; }
}

public sealed class EditCompletedChaptersBody
{
    [Required]
    public required bool[] CompletedChapters { get; init; }
}
