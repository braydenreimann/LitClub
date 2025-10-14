using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;


namespace LitClubApi.Endpoints.Libraries.GetLibrary;

[ApiController]

public class Get(Container libraryContainer) : EndpointBaseAsync
    .WithRequest<GetLibraryRequest>
    .WithActionResult<LibraryResponse>
{
    [HttpGet("libraries/{UserId}", Name = "libraries")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryResponse>> HandleAsync(
            [FromRoute] GetLibraryRequest request,
            CancellationToken cancellationToken = default)
    {
        // Fetch the library from the container
        try
        {
            var read = await libraryContainer.ReadItemAsync<Library>(
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
                cancellationToken: cancellationToken
            );
            // Map the domain library to a response
            LibraryResponse getLibraryResponse = read.Resource.ToResponse();
            return Ok(getLibraryResponse);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
