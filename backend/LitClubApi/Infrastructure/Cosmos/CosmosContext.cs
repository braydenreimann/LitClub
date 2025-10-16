using LitClubApi.Configuration;
using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Options;

namespace LitClubApi.Infrastructure.Cosmos;

public sealed class CosmosContext : ICosmosContext
{
    public CosmosContext(CosmosClient client, IOptions<CosmosOptions> options)
    {
        var o = options.Value;
        Books = client.GetContainer(o.DatabaseId, o.BooksContainerId);
        Users = client.GetContainer(o.DatabaseId, o.UsersContainerId);
        LitClubs = client.GetContainer(o.DatabaseId, o.LitClubsContainerId);
        Libraries = client.GetContainer(o.DatabaseId, o.LibrariesContainerId);
    }

    public Container Books { get; }

    public Container Users { get; }

    public Container LitClubs { get; }

    public Container Libraries { get; }
}
