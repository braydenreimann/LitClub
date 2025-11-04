namespace LitClubApi.Domain;

public class Author
{
    public required string AuthorId { get; init; }
    public required string Username { get; init; }
    public string? ProfilePhotoUrl { get; init; }
}