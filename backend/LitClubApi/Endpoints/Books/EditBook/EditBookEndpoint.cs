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
        EditBookRequest request,
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

        if (request.Body.Title is not null) updatedBook.Title = request.Body.Title;
        if (request.Body.Author is not null) updatedBook.Author = request.Body.Author;
        if (request.Body.TotalChapters is not null) updatedBook.TotalChapters = request.Body.TotalChapters.Value;
        if (request.Body.Genre is not null) updatedBook.Genre = request.Body.Genre;
        if (request.Body.Description is not null) updatedBook.Description = request.Body.Description;
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
