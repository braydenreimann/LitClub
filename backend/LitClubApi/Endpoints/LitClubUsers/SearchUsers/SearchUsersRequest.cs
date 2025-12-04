using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.LitClubUsers.SearchUsers
{
    public class SearchUsersRequest
    {
        [FromQuery(Name = "query")]
        public string? Query { get; init; }
    }
}
