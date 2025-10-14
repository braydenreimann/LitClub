using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.DeleteLibrary;

[ApiController]

public class Delete(Container librariesContainer) : EndpointBaseAsync
        .WithRequest<DeleteLibraryRequest>
        .WithActionResult
{
    [HttpDelete("libraries/{UserId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        [FromRoute] DeleteLibraryRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await librariesContainer.DeleteItemAsync<Library>(
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
        return NoContent();
    }
}
