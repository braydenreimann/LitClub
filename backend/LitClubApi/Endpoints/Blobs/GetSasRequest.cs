using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Blobs.GenerateSas;

public sealed class GetSasRequest
{
    [FromRoute(Name = "blobName")]
    public required string BlobName { get; set; }
}