using Ardalis.ApiEndpoints;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using LitClubApi.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System.Net;
using System.Net.Sockets;

namespace LitClubApi.Endpoints.Blobs.SasWrite;

// This endpoint does NOT write to blob storage. It returns an SAS URI,
// giving the frontend temporary create/write permissions to a blob.
[ApiController]
public class Get(BlobServiceClient blobServiceClient, IOptions<BlobOptions> blobOptions)
	: EndpointBaseAsync
		.WithRequest<SasWriteRequest>
		.WithActionResult<SasWriteResponse>
{
	[HttpGet("generate-sas-write/{blobName}")]
	[Produces("application/json")]
	[ProducesResponseType(typeof(SasWriteResponse), StatusCodes.Status200OK)]
	[ProducesResponseType(StatusCodes.Status404NotFound)]
	[ProducesResponseType(StatusCodes.Status500InternalServerError)]
	public override Task<ActionResult<SasWriteResponse>> HandleAsync(
		SasWriteRequest request,
		CancellationToken cancellationToken = default)
	{
		// Get the container and blob clients
		var containerClient = blobServiceClient.GetBlobContainerClient(blobOptions.Value.ContainerName);
		var blobClient = containerClient.GetBlobClient(request.BlobName);

		// Build SAS with limited permissions and short expiration
		var sasBuilder = new BlobSasBuilder
		{
			BlobContainerName = containerClient.Name,
			BlobName = request.BlobName,
			Resource = "b", // blob
			ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
		};

		sasBuilder.SetPermissions(BlobSasPermissions.Create | BlobSasPermissions.Write);

		if (!blobClient.CanGenerateSasUri)
		{
			ActionResult<SasWriteResponse> errorResult =
				StatusCode(
					StatusCodes.Status500InternalServerError,
					"SAS cannot be generated because BlobClient is not authorized with a Shared Key.");

			return Task.FromResult(errorResult);
		}

		var sasUri = blobClient.GenerateSasUri(sasBuilder);
		var uriString = sasUri.ToString();

		// Replace loopback with LAN IP when applicable so other devices can use the link
		var host = GetLanIpAddress(HttpContext);
		if (!string.IsNullOrWhiteSpace(host))
		{
			uriString = uriString
				.Replace("127.0.0.1", host)
				.Replace("localhost", host);
		}

		var response = new SasWriteResponse { SasUri = uriString };
		ActionResult<SasWriteResponse> okResult = Ok(response);

		return Task.FromResult(okResult);
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
			.FirstOrDefault(ip =>
				ip.AddressFamily == AddressFamily.InterNetwork &&
				!IPAddress.IsLoopback(ip))
			?.ToString();
	}
}