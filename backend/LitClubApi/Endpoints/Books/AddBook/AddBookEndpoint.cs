using Ardalis.ApiEndpoints;
using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;
using Microsoft.AspNetCore.Mvc;
using LitClubApi.Infrastructure.Cosmos;

namespace LitClubApi.Endpoints.Books.AddBook;

[ApiController]
public class Add(ICosmosContext cosmosContext) : EndpointBaseAsync
    .WithRequest<AddBookRequest>
    .WithActionResult<BookResponse>
{
    [HttpPost("books")]
    [Consumes("application/json")]
    [Produces("application/json")]
    [ProducesResponseType(typeof(BookResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public override async Task<ActionResult<BookResponse>> HandleAsync(
    AddBookRequest request,
    CancellationToken cancellationToken = default)
    {
        // Map the request to domain book object
        Book book = AddBookMapper.ToDomain(request);

        var pk = new PartitionKey(book.Id);

        try
        {
            var result = await cosmosContext.Books.CreateItemAsync(book, pk, cancellationToken: cancellationToken);
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
