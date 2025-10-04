using Microsoft.Azure.Cosmos;
using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Books.GetBook;

public class GetBookById(Container booksContainer) : EndpointBaseAsync
    .WithRequest<GetBookRequest>
    .WithActionResult<GetBookResponse>
{

    [HttpGet("books/{bookId}", Name = "books")]
    public override async Task<ActionResult<GetBookResponse>> HandleAsync(
            [FromRoute] GetBookRequest request,
            CancellationToken cancellationToken = default)
    {
        Book? book;

        // Fetch the book from the container
        try
        {
            book = await booksContainer.ReadItemAsync<Book>(
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken
            );
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        // Map the domain book to a response
        GetBookResponse getBookResponse = GetBookMapper.ToResponse(book);

        return Ok(getBookResponse);
    }
}
