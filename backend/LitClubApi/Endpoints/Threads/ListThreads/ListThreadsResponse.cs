namespace LitClubApi.Endpoints.Threads.ListThreads;

public sealed class ListThreadsResponse
{
    public required List<ThreadResponse> Items { get; init; }
    public string? ContinuationToken { get; init; }
}