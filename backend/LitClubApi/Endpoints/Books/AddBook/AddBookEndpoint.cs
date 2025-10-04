using Microsoft.Azure.Cosmos;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.AddBook;

public class Add(Container booksContainer) : EndpointBaseAsync
    .WithRequest<AddBookRequest>
    .WithActionResult<AddBookResponse>
{
    [HttpPost("books")]
    public override async Task<ActionResult<AddBookResponse>> HandleAsync(AddBookRequest request,
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

        // Map the domain book to a responses
        AddBookResponse response = AddBookMapper.ToResponse(book);

        return CreatedAtRoute("books", new { bookId = response.Id }, response);
    }
}