using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Infrastructure.Cosmos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.Editions.EditEdition;

[ApiController]
public class Edit(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<EditEditionRequest>
    .WithActionResult<EditionResponse>
{
    [HttpPatch("books/{bookId}/editions/{editionId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
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
            var response = await cosmosContext.Books.ReadItemAsync<Book>(
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

        if (request.Body.Format.HasValue)
        {
            edition.Format = request.Body.Format.Value.ToDomain();
        }

        if (request.Body.Publisher is not null)
        {
            edition.Publisher = request.Body.Publisher;
        }

        if (request.Body.PublicationDate.HasValue)
        {
            edition.PublicationDate = request.Body.PublicationDate.Value;
        }

        if (request.Body.PrintLength.HasValue)
        {
            edition.PrintLength = request.Body.PrintLength;
        }

        if (request.Body.Isbn13s is not null)
        {
            edition.Isbn13s = [.. request.Body.Isbn13s];
        }

        try
        {
            await cosmosContext.Books.ReplaceItemAsync(
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
