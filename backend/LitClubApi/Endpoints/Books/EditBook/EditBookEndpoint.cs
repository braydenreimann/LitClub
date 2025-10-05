using Microsoft.Azure.Cosmos;
using Ardalis.ApiEndpoints;
using LitClubApi.Domain;
using LitClubApi.Endpoints.Books;
using Microsoft.AspNetCore.Mvc;

namespace LitClubApi.Endpoints.Books.EditBook;

public class Edit(Container booksContainer) : EndpointBaseAsync
    .WithRequest<EditBookRequest>
    .WithActionResult<BookResponse>
{
    [HttpPatch("books/{bookId}")]
    public override async Task<ActionResult<BookResponse>> HandleAsync(EditBookRequest request,
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
        if (request.Genres is not null) updatedBook.Genres = [.. request.Genres];
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
