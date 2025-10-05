using Microsoft.Azure.Cosmos;
using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Books.GetBook;

public class Get(Container booksContainer) : EndpointBaseAsync
    .WithRequest<GetBookRequest>
    .WithActionResult<BookResponse>
{

    [HttpGet("books/{bookId}", Name = "books")]
    public override async Task<ActionResult<BookResponse>> HandleAsync(
            [FromRoute] GetBookRequest request,
            CancellationToken cancellationToken = default)
    {
        // Fetch the book from the container
        try
        {
            var read = await booksContainer.ReadItemAsync<Book>(
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken
            );

            // Map the domain book to a response
            BookResponse getBookResponse = read.Resource.ToResponse();

            return Ok(getBookResponse);
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }
    }
}
