using Ardalis.ApiEndpoints;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using LitClubApi.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Sockets;

namespace LitClubApi.Endpoints.Blobs.SasRead;

[ApiController]
public class Get(BlobServiceClient blobServiceClient, IOptions<BlobOptions> blobOptions) : EndpointBaseAsync
    .WithRequest<SasReadRequest>
    .WithActionResult<SasReadResponse>
{
    [HttpGet("generate-sas-read/{blobName}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(SasReadResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<SasReadResponse>> HandleAsync(
        SasReadRequest request,
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
        var uriString = sasUri.ToString();

        // Replace localhost/loopback with the LAN IP so physical devices can reach Azurite.
        var host = GetLanIpAddress(HttpContext);
        if (!string.IsNullOrWhiteSpace(host))
        {
            uriString = uriString
                .Replace("127.0.0.1", host)
                .Replace("localhost", host);
        }

        return Ok(new SasReadResponse { SasUri = uriString });
    }

    private static string? GetLanIpAddress(HttpContext httpContext)
    {
        // Prefer the address the request hit (avoids picking loopback).
        var localIp = httpContext?.Connection?.LocalIpAddress;
        if (localIp is not null
            && localIp.AddressFamily == AddressFamily.InterNetwork
            && !IPAddress.IsLoopback(localIp)
            && !localIp.Equals(IPAddress.Any))
        {
            return localIp.ToString();
        }

        // Fallback: first non-loopback IPv4 on the host.
        return Dns.GetHostAddresses(Dns.GetHostName())
            .FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
            ?.ToString();
    }
}
