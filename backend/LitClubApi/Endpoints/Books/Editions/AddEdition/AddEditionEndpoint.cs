using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;

namespace LitClubApi.Endpoints.Books.Editions.AddEdition;

[ApiController]
public class Add(Container booksContainer) : EndpointBaseAsync
.WithRequest<AddEditionRequest>
.WithActionResult<EditionResponse>
{
    [HttpPost("books/{bookId}/editions")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(EditionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<EditionResponse>> HandleAsync(
        [FromRoute] AddEditionRequest request,
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

        var b = request.Body;

        Edition newEdition = new()
        {
            Format = b.Format.ToDomain(),
            Publisher = b.Publisher,
            PublicationDate = b.PublicationDate,
            PrintLength = b.PrintLength,
            Isbn13s = [.. b.Isbn13s]
        };

        book.Editions.Add(newEdition);

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

        return CreatedAtRoute(
            routeName: "book-editions-get",
            routeValues: new { bookId = book.Id, editionId = newEdition.Id },
            value: newEdition.ToResponse());
    }
}
