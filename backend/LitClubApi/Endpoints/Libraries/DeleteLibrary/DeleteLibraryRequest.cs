using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.DeleteLibrary;

public sealed class DeleteLibraryRequest
{
    [FromRoute(Name = "userId")]
    public required string UserId { get; init; }
}
