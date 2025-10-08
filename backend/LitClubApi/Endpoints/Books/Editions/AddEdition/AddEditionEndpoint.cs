using System.Net;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.Editions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;

namespace LitClubApi.Endpoints.Books.Editions.AddEdition;

public class Add(Container booksContainer) : EndpointBaseAsync
    .WithRequest<AddEditionRequest>
    .WithActionResult<EditionResponse>
{
    [HttpPost("books/{bookId}/editions")]
    [ProducesResponseType(typeof(EditionResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<EditionResponse>> HandleAsync(
        AddEditionRequest request,
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

        Edition newEdition = new()
        {
            Format = request.Format.ToDomain(),
            Publisher = request.Publisher,
            PublicationDate = request.PublicationDate,
            PrintLength = request.PrintLength,
            Isbn13s = [.. request.Isbn13s]
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

        EditionResponse responseBody = newEdition.ToResponse();
        return CreatedAtRoute("book-editions-get", new { bookId = book.Id, editionId = newEdition.Id }, responseBody);
    }
}
