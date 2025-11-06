namespace LitClubApi.Configuration;

public sealed class CosmosOptions
{
    public required string Endpoint { get; init; }
    public required string PrimaryKey { get; init; }
    public required string DatabaseId { get; init; }
    public required string BooksContainerId { get; init; }
    public required string UsersContainerId { get; init; }
    public required string LitClubsContainerId { get; init; }
    public required string LibrariesContainerId { get; init; }
    public required string ThreadsContainerId { get; init; }
}