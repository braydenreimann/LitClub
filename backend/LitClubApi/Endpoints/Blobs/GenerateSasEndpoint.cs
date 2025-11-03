using Ardalis.ApiEndpoints;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using LitClubApi.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace LitClubApi.Endpoints.Blobs.GenerateSas;

[ApiController]
public class Get(BlobServiceClient blobServiceClient, IOptions<BlobOptions> blobOptions) : EndpointBaseAsync
    .WithRequest<GetSasRequest>
    .WithActionResult<SasResponse>
{
    [HttpGet("generate-sas/{blobName}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(SasResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<SasResponse>> HandleAsync(
        GetSasRequest request,
        CancellationToken cancellationToken = default)
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(blobOptions.Value.ContainerName);
        var blobClient = containerClient.GetBlobClient(request.BlobName);

        if (!await blobClient.ExistsAsync(cancellationToken))
        {
            return NotFound("Blob not found.");
        }

        var sasBuilder = new BlobSasBuilder()
        {
            BlobContainerName = containerClient.Name,
            BlobName = request.BlobName,
            Resource = "b",
            ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Read);

        if (!blobClient.CanGenerateSasUri)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
            "SAS cannot be generated because BlobClient is not authorized with a Shared Key.");
        }

        var sasUri = blobClient.GenerateSasUri(sasBuilder);
        return Ok(new SasResponse { SasUri = sasUri.ToString() });
    }
}