using Newtonsoft.Json;

namespace LitClubApi.Domain;

public class Book
{
    [JsonProperty(PropertyName = "id")]
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string Title { get; set; }
    public required string Author { get; set; }
    public required int TotalChapters { get; set; }
    public List<string> Genres { get; set; } = [];
    public string? Description { get; set; }
    public List<Edition> Editions { get; set; } = [];
}