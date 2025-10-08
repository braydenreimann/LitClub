using System.Linq;
using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.Editions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;

namespace LitClubApi.Endpoints.Books.Editions.EditEdition;

public class Edit(Container booksContainer) : EndpointBaseAsync
    .WithRequest<EditEditionRequest>
    .WithActionResult<EditionResponse>
{
    [HttpPatch("books/{bookId}/editions/{editionId}")]
    [ProducesResponseType(typeof(EditionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<EditionResponse>> HandleAsync(
        EditEditionRequest request,
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

        if (request.Format.HasValue)
        {
            edition.Format = request.Format.Value.ToDomain();
        }

        if (request.Publisher is not null)
        {
            edition.Publisher = request.Publisher;
        }

        if (request.PublicationDate.HasValue)
        {
            edition.PublicationDate = request.PublicationDate.Value;
        }

        if (request.PrintLength.HasValue)
        {
            edition.PrintLength = request.PrintLength;
        }

        if (request.Isbn13s is not null)
        {
            edition.Isbn13s = [.. request.Isbn13s];
        }

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

        return Ok(edition.ToResponse());
    }
}
