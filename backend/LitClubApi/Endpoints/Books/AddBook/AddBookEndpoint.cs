using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace LitClubApi.Endpoints.Books.AddBook;

public class Add(Container booksContainer) : EndpointBaseAsync
    .WithRequest<AddBookRequest>
    .WithActionResult<BookResponse>
{
    [HttpPost("books")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<BookResponse>> HandleAsync(AddBookRequest request,
    CancellationToken cancellationToken = default)
    {
        // Map the request to domain book object
        Book book = AddBookMapper.ToDomain(request);

        var pk = new PartitionKey(book.Id);

        try
        {
            var result = await booksContainer.CreateItemAsync(book, pk, cancellationToken: cancellationToken);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        // Map the domain book to a response
        BookResponse response = book.ToResponse();

        return CreatedAtRoute("books", new { bookId = response.Id }, response);
    }
}
