using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace LitClubApi.Endpoints.Blobs.GenerateSas;

public static class GenerateSasEndpoint
{
    public static void MapGenerateSasEndpoint(this WebApplication app)
    {
        app.MapGet("/blobs/generate-sas", async (string blobName, BlobServiceClient blobServiceClient) =>
        {
            var containerClient = blobServiceClient.GetBlobContainerClient("images");
            var blobClient = containerClient.GetBlobClient(blobName);
            if (!await blobClient.ExistsAsync())
                return Results.NotFound("Blob not found");

            // Set the expiry time and permissions for the SAS
            BlobSasBuilder sasBuilder = new BlobSasBuilder()
            {
                BlobContainerName = containerClient.Name,
                BlobName = blobClient.Name,
                Resource = "b",
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(1)
            };
            sasBuilder.SetPermissions(BlobSasPermissions.Read);
            
            var accountName = "devstoreaccount1";
            var accountKey = "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
            
            // Generate the SAS token
            var sasToken = sasBuilder.ToSasQueryParameters(
                new StorageSharedKeyCredential(accountName, accountKey)
            ).ToString();
            var sasUri = $"{blobClient.Uri}?{sasToken}";
            return Results.Ok(new { SasUri = sasUri });
        })
        .WithName("GenerateSas")
        .Produces(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status404NotFound);
    }
}