using Ardalis.ApiEndpoints;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using LitClubApi.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Sockets;

namespace LitClubApi.Endpoints.Blobs.SasWrite;

//This DOES NOT write to blob storage. This returns an SAS URI, giving the user on the frontend create/write permissions to a space in blob storage.
[ApiController]
public class Get(BlobServiceClient blobServiceClient, IOptions<BlobOptions> blobOptions) : EndpointBaseAsync
    .WithRequest<SasWriteRequest>
    .WithActionResult<SasWriteResponse>
{
    [HttpGet("generate-sas-write/{blobName}")]
	[Consumes("application/json")]
	[Produces("application/json")]
    [ProducesResponseType(typeof(SasWriteResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public override async Task<ActionResult<SasWriteResponse>> HandleAsync(
		SasWriteRequest request,
		CancellationToken cancellationToken = default)
	{
		var containerClient = blobServiceClient.GetBlobContainerClient(blobOptions.Value.ContainerName);
		var blobClient = containerClient.GetBlobClient(request.BlobName);

		var sasBuilder = new BlobSasBuilder()
		{
			BlobContainerName = containerClient.Name,
			BlobName = request.BlobName,
			Resource = "b",
			ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
		};
		sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

		if (!blobClient.CanGenerateSasUri)
		{
			return StatusCode(StatusCodes.Status500InternalServerError,
				"SAS cannot be generated because BlobClient is not authorized with a Shared Key.");
		}

		var sasUri = blobClient.GenerateSasUri(sasBuilder);
		var uriString = sasUri.ToString();

		var host = GetLanIpAddress(HttpContext);
		if (!string.IsNullOrWhiteSpace(host))
		{
			uriString = uriString
				.Replace("127.0.0.1", host)
				.Replace("localhost", host);
		}

		return Ok(new SasWriteResponse { SasUri = uriString });
	}

	private static string? GetLanIpAddress(HttpContext httpContext)
	{
		var localIp = httpContext?.Connection?.LocalIpAddress;
		if (localIp is not null
			&& localIp.AddressFamily == AddressFamily.InterNetwork
			&& !IPAddress.IsLoopback(localIp)
			&& !localIp.Equals(IPAddress.Any))
		{
			return localIp.ToString();
		}

		return Dns.GetHostAddresses(Dns.GetHostName())
			.FirstOrDefault(ip => ip.AddressFamily == AddressFamily.InterNetwork && !IPAddress.IsLoopback(ip))
			?.ToString();
	}
}
