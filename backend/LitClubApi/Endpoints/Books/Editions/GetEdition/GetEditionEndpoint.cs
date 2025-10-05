using System.Linq;
using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.Editions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.Editions.GetEdition;

public class Get(Container booksContainer) : EndpointBaseAsync
    .WithRequest<GetEditionRequest>
    .WithActionResult<EditionResponse>
{
    [HttpGet("books/{bookId}/editions/{editionId}", Name = "book-editions-get")]
    public override async Task<ActionResult<EditionResponse>> HandleAsync(
        GetEditionRequest request,
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

        return Ok(edition.ToResponse());
    }
}
