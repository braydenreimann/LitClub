using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.GetLibrary;

public class GetLibraryRequest
{
    [FromRoute(Name = "UserId")]
    public required string UserId { get; init; }
}
