// using Ardalis.ApiEndpoints;
// using LitClubApi.Domain;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.Azure.Cosmos;

// namespace LitClubApi.Endpoints.Libraries.ListLibraries;

// [ApiController]
// public class List(Container libraryContainer) : EndpointBaseAsync
//     .WithRequest<ListLibrariesRequest>
//     .WithActionResult<ListLibrariesResponse>
// {
//     [HttpGet("libraries")]
//     [Consumes("application/json")]
//     [Produces("application/json")]
//     [ProducesResponseType(typeof(ListLibrariesResponse), StatusCodes.Status200OK)]
//     [ProducesResponseType(StatusCodes.Status500InternalServerError)]
//     public override async Task<ActionResult<ListLibrariesResponse>> HandleAsync(
//         ListLibrariesRequest request,
//         CancellationToken cancellationToken = default)
//     {
//         int pageSize = request.ClampPageSize();

//         FeedIterator<Library> iterator = libraryContainer.GetItemQueryIterator<Library>(
//             queryDefinition: new QueryDefinition("SELECT * FROM c"),
//             continuationToken: request.ContinuationToken,
//             requestOptions: new QueryRequestOptions
//             {
//                 MaxItemCount = pageSize
//             });
//         try
//         {
//             if (!iterator.HasMoreResults)
//             {
//                 return Ok(new ListLibrariesResponse
//                 {
//                     Libraries = [],
//                     ContinuationToken = null
//                 });
//             }
//             FeedResponse<Library> page = await iterator.ReadNextAsync(cancellationToken);
//             return Ok(new ListLibrariesResponse
//             {
//                 Libraries = [.. page.Select(library => library.ToResponse())],
//                 ContinuationToken = page.ContinuationToken
//             });
//         }
//         catch (CosmosException)
//         {
//             return StatusCode(500, "Unable to access database");
//         }
//     }
// }