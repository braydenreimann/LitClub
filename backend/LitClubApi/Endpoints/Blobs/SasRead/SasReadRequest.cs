using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Blobs.SasRead;

public sealed class SasReadRequest
{
    [FromRoute(Name = "blobName")]
    public required string BlobName { get; set; }
}