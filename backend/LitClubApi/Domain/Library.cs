using Newtonsoft.Json;

namespace LitClubApi.Domain
{
    public class Library
    {
        [JsonProperty(PropertyName = "id")]
        public required string OwnerId { get; set; }
        public List<LibraryBook> LibraryBooks { get; set; } = [];
    }
}