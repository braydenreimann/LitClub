using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Libraries.LibraryBooks.EditLibraryBook;

[ApiController]
public class Edit(Container librariesContainer) : EndpointBaseAsync
    .WithRequest<EditLibraryBookRequest>
    .WithActionResult<LibraryBookResponse>
{
    [HttpPatch("libraries/{UserId}/LibraryBooks/{Isbn13}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(LibraryBookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<LibraryBookResponse>> HandleAsync(
        [FromRoute] EditLibraryBookRequest request,
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
        var libraryBook = library.LibraryBooks.FirstOrDefault(lb => lb.Isbn13 == request.Isbn13);
        if (libraryBook is null)
        {
            return NotFound();
        }

        var b = request.Body;
        if (b.Status.HasValue)
        {
            libraryBook.Status = b.Status.Value.ToDomain();
        }
        if (b.StartedReading.HasValue)
        {
            libraryBook.StartedReading = b.StartedReading;
        }
        if (b.FinishedReading.HasValue)
        {
            libraryBook.FinishedReading = b.FinishedReading;
        }
        if (b.CurrentPage.HasValue)
        {
            libraryBook.CurrentPage = b.CurrentPage;
        }
        if (b.PercentComplete.HasValue)
        {
            libraryBook.PercentComplete = b.PercentComplete;
        }
        if (b.OnPedastal.HasValue)
        {
            libraryBook.OnPedastal = b.OnPedastal.Value;
        }
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
        return Ok(libraryBook.ToResponse());
    }
}
