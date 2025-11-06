using Microsoft.Azure.Cosmos;

namespace LitClubApi.Infrastructure.Cosmos;

public interface ICosmosContext
{
    Container Books { get; }
    Container Users { get; }
    Container LitClubs { get; }
    Container Libraries { get; }
    Container Threads { get; }
}