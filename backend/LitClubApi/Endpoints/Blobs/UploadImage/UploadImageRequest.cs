namespace LitClubApi.Endpoints.Blobs.UploadImage
{
    public class UploadImageRequest
    {
        public IFormFile File { get; set; } = default!;
    }
}
