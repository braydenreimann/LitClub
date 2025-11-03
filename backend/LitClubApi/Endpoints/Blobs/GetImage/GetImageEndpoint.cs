using Azure.Storage.Blobs;

public static class GetImageEndpoint
{
    public static void MapGetImageEndpoint(this WebApplication app)
    {
        app.MapGet("/images/{imageName}", async (string imageName) =>
        {
            var blobClient = new BlobClient("<connection-string>", "<container-name>", imageName);

            if (!await blobClient.ExistsAsync())
                return Results.NotFound("Image not found");

            var download = await blobClient.DownloadContentAsync();
            var content = download.Value.Content.ToArray();

            // Results.File tells Swagger this endpoint returns a file
            return Results.File(content, "image/png", imageName);
        })
        .WithName("GetImage")
        .Produces(StatusCodes.Status200OK, contentType: "image/png")
        .Produces(StatusCodes.Status404NotFound);
    }
}