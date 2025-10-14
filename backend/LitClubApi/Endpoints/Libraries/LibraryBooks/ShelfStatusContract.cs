using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
namespace LitClubApi.Endpoints.Libraries.LibraryBooks

[JsonConverter(typeof(StringEnumConverter))]
public enum ShelfStatusContract
{
    hasRead,
    currentlyReading,
    Hiatus,
    WantToRead,
}
