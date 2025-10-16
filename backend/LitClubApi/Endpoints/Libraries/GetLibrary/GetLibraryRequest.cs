using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.GetLibrary;

public class GetLibraryRequest
{
    [FromRoute(Name = "ownerId")]
    public required string OwnerId { get; init; }
}