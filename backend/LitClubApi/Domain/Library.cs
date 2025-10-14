namespace LitClubApi.Domain
{
    public class Library
    {
        public required string UserId { get; set; }
        public List<LibraryBook>? LibraryBooks { get; set; } = [];
    }
}
