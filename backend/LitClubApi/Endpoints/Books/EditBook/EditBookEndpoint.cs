using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.EditBook;

[ApiController]
public class Edit(Container booksContainer) : EndpointBaseAsync
    .WithRequest<EditBookRequest>
    .WithActionResult<BookResponse>
{
    [HttpPatch("books/{bookId}")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<BookResponse>> HandleAsync(
        [FromRoute] EditBookRequest request,
        CancellationToken cancellationToken = default)
    {
        Book updatedBook;

        // Fetch the book from the container
        try
        {
            var read = await booksContainer.ReadItemAsync<Book>(
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken
            );
            updatedBook = read.Resource;
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        if (request.Title is not null) updatedBook.Title = request.Title;
        if (request.Author is not null) updatedBook.Author = request.Author;
        if (request.TotalChapters is not null) updatedBook.TotalChapters = request.TotalChapters.Value;
        if (request.Genre is not null) updatedBook.Genre =  request.Genre;
        if (request.Description is not null) updatedBook.Description = request.Description;
        try
        {
            await booksContainer.ReplaceItemAsync(
                item: updatedBook,
                id: request.BookId,
                partitionKey: new PartitionKey(request.BookId),
                cancellationToken: cancellationToken
            );
        }
        catch (CosmosException)
        {
            return StatusCode(500, "Unable to access database");
        }

        // Map the domain book to a response and return 200 OK for an edit
        var response = updatedBook.ToResponse();
        return Ok(response);
    }
}
