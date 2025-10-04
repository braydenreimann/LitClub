using System.ComponentModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LitClubApi.Endpoints.Books.AddBook;

public sealed class AddBookRequest
{
    public required string Title { get; init; }
    public required string Author { get; init; }
    public required int TotalChapters { get; init; }
    public List<string> Genres { get; set; } = [];
    public string? Description { get; set; }
    public required List<AddEditionRequest> Editions { get; set; } = [];
}

public sealed class AddEditionRequest
{
    [JsonConverter(typeof(StringEnumConverter))]
    public required AddBookFormatRequest Format { get; init; }
    public required string Publisher { get; init; }
    [JsonConverter(typeof(DateOnlyConverter))]
    public required DateOnly PublicationDate { get; init; }
    public int? PrintLength { get; init; }
    public required List<string> Isbn13s { get; init; } = [];
}

public enum AddBookFormatRequest
{
    Paperback,
    Hardcover,
    eBook
}