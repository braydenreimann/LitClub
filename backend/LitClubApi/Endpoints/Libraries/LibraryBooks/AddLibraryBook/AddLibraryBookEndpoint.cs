using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.AddLibraryBook;

[ApiController]
public class Add(Container librariesContainer) : EndpointBaseAsync
    .WithRequest<AddLibraryBookRequest>
    .WithActionResult<LibraryBookResponse>
{
    [HttpPost("libraries/{UserId}/LibraryBooks")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryBookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryBookResponse>> HandleAsync(
        [FromRoute] AddLibraryBookRequest request,
        CancellationToken cancellationToken = default)
    {
        Library? library;
        try
        {
            var response = await librariesContainer.ReadItemAsync<Library>(
                id: request.UserId,
                partitionKey: new PartitionKey(request.UserId),
                cancellationToken: cancellationToken);
            library = response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        var b = request.Body;

        LibraryBook newLibraryBook = new()
        {
            Isbn13 = b.Isbn13,
            Status = b.Status.ToDomain(),
            StartedReading = b.StartedReading,
            FinishedReading = b.FinishedReading,
            CurrentPage = b.CurrentPage,
            PercentComplete = b.PercentComplete,
            OnPedastal = b.OnPedastal
        };

        library.LibraryBooks.Add(newLibraryBook);
        
        try
        {
            await librariesContainer.ReplaceItemAsync(
                item: library,
                id: library.UserId,
                partitionKey: new PartitionKey(library.UserId),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
        // Map the domain library book to a response
        LibraryBookResponse responseDto = newLibraryBook.ToResponse();
        return CreatedAtRoute("libraries", new { userId = library.UserId }, responseDto);
    }
}
