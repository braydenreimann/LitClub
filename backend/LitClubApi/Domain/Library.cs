namespace LitClubApi.Domain
{
    public class Library
    {
        public required string UserId { get; set; }
        public List<LibBook>? Books { get; set; } = [];
    }
}
