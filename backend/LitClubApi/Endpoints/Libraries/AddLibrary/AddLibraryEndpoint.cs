using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;  
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Libraries.AddLibrary
{
    public class Add(Container librariesContainer) : EndpointBaseAsync
        .WithRequest<AddLibraryRequest>
        .WithActionResult<LibraryResponse>
    {
        [HttpPost("libraries")]
        [Consumes("application/json")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(LibraryResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public override async Task<ActionResult<LibraryResponse>> HandleAsync(
            AddLibraryRequest request,
            CancellationToken cancellationToken = default)
        {
            // Map the request to domain library object
            Library library = AddLibraryMapper.ToDomain(request);

            var pk = new PartitionKey(library.UserId);

            try
            {
                var result = await librariesContainer.CreateItemAsync(library, pk, cancellationToken: cancellationToken);
            }
            catch (CosmosException)
            {
                return StatusCode(500, "Unable to access database");
            }
            // Map the domain library to a response
            LibraryResponse response = library.ToResponse();

            return CreatedAtRoute("libraries", new { userId = response.UserId }, response);
        }
    }
}
