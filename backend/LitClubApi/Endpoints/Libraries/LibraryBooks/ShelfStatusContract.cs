using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks;

[JsonConverter(typeof(StringEnumConverter))]
public enum ShelfStatusContract
{
    notInYourLibrary,
    currentlyReading,
    futureReads,
    pastReads,
}