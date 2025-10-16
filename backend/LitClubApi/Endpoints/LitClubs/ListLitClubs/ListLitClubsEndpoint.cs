using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.LitClubs.ListLitClubs;

[ApiController]
public class List(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<ListLitClubsRequest>
    .WithActionResult<ListLitClubsResponse>
{
    [HttpGet("litclubs")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(ListLitClubsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<ListLitClubsResponse>> HandleAsync(
        ListLitClubsRequest request,
        CancellationToken cancellationToken = default)
    {
        int pageSize = request.ClampPageSize();

        FeedIterator<LitClub> iterator = cosmosContext.LitClubs.GetItemQueryIterator<LitClub>(
            queryDefinition: new QueryDefinition("SELECT * FROM c"),
            continuationToken: request.ContinuationToken,
            requestOptions: new QueryRequestOptions
            {
                MaxItemCount = pageSize
            });

        try
        {
            if (!iterator.HasMoreResults)
            {
                return Ok(new ListLitClubsResponse
                {
                    LitClubs = [],
                    ContinuationToken = null
                });
            }

            FeedResponse<LitClub> page = await iterator.ReadNextAsync(cancellationToken);

            return Ok(new ListLitClubsResponse
            {
                LitClubs = [.. page.Select(club => club.ToResponse())],
                ContinuationToken = page.ContinuationToken
            });
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
