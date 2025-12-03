using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Libraries;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.AddLibrary
{
    [ApiController]
    public class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
        .WithRequest<AddLibraryRequest>
        .WithActionResult<LibraryResponse>
    {
        [HttpPost("libraries")]
        [Consumes("application/json")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(LibraryResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public override async Task<ActionResult<LibraryResponse>> HandleAsync(
            AddLibraryRequest request,
            CancellationToken cancellationToken = default)
        {
            // Map the request to domain library object
            Library library = AddLibraryMapper.ToDomain(request);

            try
            {
                await cosmosContext.Libraries.CreateItemAsync(
                    library,
                    new PartitionKey(library.OwnerId),
                    cancellationToken: cancellationToken);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                return Conflict("Library already exists for this owner.");
            }
            catch (CosmosException)
            {
                return StatusCode(500, "Unable to access database");
            }

            // Map the domain library to a response
            LibraryResponse response = library.ToResponse();

            return CreatedAtRoute("libraries", new { ownerId = response.OwnerId }, response);
        }
    }
}
