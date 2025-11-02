using Azure.Storage.Blobs;
using LitClubApi.Endpoints.Blobs.UploadImage;
using Microsoft.AspNetCore.Http;

namespace LitClubApi.Endpoints.Blobs
{
    public static class UploadImageEndpoint
    {
        public static void MapUploadImageEndpoint(this WebApplication app)
        {
            app.MapPost("/blobs/upload-image", async (UploadImageRequest request, BlobServiceClient blobServiceClient) =>
            {
                var file = request.File;

                if (file == null || file.Length == 0)
                    return Results.BadRequest("No file uploaded.");

                // Choose container name (make sure it exists in Azure)
                var containerName = "images";
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                
                if (containerClient == null)
                {
                    return Results.BadRequest("Blob container not found.");
                }
                
                // Use the uploaded file name
                var blobClient = containerClient.GetBlobClient(file.FileName);

                // Upload the file stream to Blob Storage
                using var stream = file.OpenReadStream();
                await blobClient.UploadAsync(stream, overwrite: true);

                // Return the URL of the uploaded blob
                return Results.Ok(new { Url = blobClient.Uri.ToString() });
            })
            .Accepts<UploadImageRequest>("multipart/form-data")  // Important for Swagger and validation
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest);
        }
    }
}
