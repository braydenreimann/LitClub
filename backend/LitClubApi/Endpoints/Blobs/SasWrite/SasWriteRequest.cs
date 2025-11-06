using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Blobs.SasWrite;

public sealed class SasWriteRequest
{
	[FromRoute(Name = "blobName")]
	public required string BlobName { get; set; }
}