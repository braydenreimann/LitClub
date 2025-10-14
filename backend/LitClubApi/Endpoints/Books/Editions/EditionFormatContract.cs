using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LitClubApi.Endpoints.Books.Editions;

[JsonConverter(typeof(StringEnumConverter))]
public enum EditionFormatContract
{
    Paperback,
    Hardcover,
    eBook,
    Audiobook,
    Mixed Media
}
