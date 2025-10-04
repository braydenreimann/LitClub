using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class Book
{
    [JsonProperty(PropertyName = "id")]
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string Title { get; init; }
    public required string Author { get; init; }
    public required int TotalChapters { get; init; }
    public List<string> Genres { get; set; } = [];
    public string? Description { get; set; }
    public required List<Edition> Editions { get; set; } = [];
}