using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.Editions.DeleteEdition;

[ApiController]
public class Delete(Container booksContainer) : EndpointBaseAsync
    .WithRequest<DeleteEditionRequest>
    .WithActionResult
{
    [HttpDelete("books/{bookId}/editions/{editionId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult> HandleAsync(
        [FromRoute] DeleteEditionRequest request,
        CancellationToken cancellationToken = default)
    {
        Book? book;

        try
        {
            var response = await booksContainer.ReadItemAsync<Book>(
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken);
            book = response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            return NotFound();
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        var edition = book.Editions.FirstOrDefault(e => e.Id == request.EditionId);
        if (edition is null)
        {
            return NotFound();
        }

        book.Editions.Remove(edition);

        try
        {
            await booksContainer.ReplaceItemAsync(
                item: book,
                id: book.Id,
                partitionKey: new PartitionKey(book.Id),
                cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        return NoContent();
    }
}
