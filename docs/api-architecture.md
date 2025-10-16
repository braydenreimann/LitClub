# LitClub API Architecture

The LitClub API is a RESTful API implemented using the REPR (Request–Endpoint–Response) design pattern.

## REST Basics
- **REST** stands for **Representational State Transfer**, an architectural style for designing networked applications.
- A **RESTful API** is an API that follows REST principles when exposing resources over HTTP.

## Core Principles of RESTful APIs
1. **Resources, not actions**  
   - Everything is modeled as a *resource* (e.g., `users`, `litclubs`, `books`).  
   - Each resource has a unique URL (`/users/123`, `/litclubs/42/members`).

2. **Stateless communication**  
   - Each request from a client contains all the info needed (auth, params, etc.).  
   - The server does not keep session state between requests.

3. **HTTP verbs map to actions**  
   - `GET` → retrieve resources  
   - `POST` → create a new resource  
   - `PUT/PATCH` → update a resource  
   - `DELETE` → remove a resource

4. **Standardized use of HTTP features**  
   - Use of **status codes** (`200 OK`, `404 Not Found`, `400 Bad Request`)  
   - Use of **headers** for metadata (content type, caching, auth)  
   - Often JSON (or XML) for request/response bodies

5. **Uniform interface**  
   - The API behaves consistently: same patterns for all resources.  
   - Makes it predictable and easy to consume.

6. **Stateless + cacheable**  
   - Responses can be explicitly marked cacheable, improving performance.

---

## DTOs (Data Transfer Objects)
A **DTO** is a simple object used to **carry data** between processes (e.g., from client to server and back).  
DTOs should:
- Contain **only** the fields needed for the operation (no domain behavior).  
- Be **separate** from your domain entities to avoid leaking internal details.  
- Provide a stable **contract** for clients, even if your internal model evolves.

---

## MVC vs. REPR (How we structure endpoints)
**Traditional MVC API**
- Groups multiple actions (e.g., `Get`, `Post`, `Put`, `Delete`) for a resource in a single **Controller** class.
- Pros: shared filters/middleware feel natural; familiar to many developers.  
- Cons: controllers often **bloat** as features grow; actions can become tightly coupled.

**REPR (Request–Endpoint–Response)**
- Treats each operation as a **single endpoint class** with its own Request DTO and Response DTO.
- Pros: strong **single-responsibility**, better **testability**, natural **vertical slicing** by feature.  
- Cons: can feel **boilerplate-y** without conventions; requires good folder/org patterns.

For LitClub, we use **REST for the external interface** and **REPR for internal organization**.

---

## Example Endpoint: Add Book (REST + REPR)

### Request
```http
POST /books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publishedYear": 1925
}
```

### Response
```http
201 Created
Content-Type: application/json

{
  "id": "2f3a6b1e-92b2-4d49-ae6d-8f6c0c3e7f1b",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publishedYear": 1925
}
```
This models the *resource* (`books`) rather than exposing an action like `addBook()`.

---

## REPR Implementation with Ardalis.ApiEndpoints (Cosmos DB)

Below is a REPR-style endpoint using **Ardalis.ApiEndpoints**.  
It uses an **Azure Cosmos DB** container directly (DI provides a `Container` for the `Books` collection).

> **Note on IDs:** Cosmos DB expects an `id` field of type `string`. We generate a GUID for new items.

### Request DTO
```csharp
public class AddBookRequest
{
    public string Title { get; set; } = default!;
    public string Author { get; set; } = default!;
    public int PublishedYear { get; set; }
}
```

### Response DTO
```csharp
public class AddBookResponse
{
    public string Id { get; set; } = default!;
    public string Title { get; set; } = default!;
    public string Author { get; set; } = default!;
    public int PublishedYear { get; set; }
}
```

### Domain Model (persisted in Cosmos DB)
```csharp
public class Book
{
    // Cosmos DB requires an 'id' string property
    public string id { get; set; } = default!;

    // Partition key (optional, depends on your design — could be 'author', 'tenantId', etc.)
    public string partitionKey { get; set; } = "books";

    public string Title { get; set; } = default!;
    public string Author { get; set; } = default!;
    public int PublishedYear { get; set; }
}
```

### Endpoint
```csharp
using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Mvc;
using Azure.Cosmos;
using System.Net;

namespace LitClub.Api.Endpoints.Books;

public class Add : EndpointBaseAsync
    .WithRequest<AddBookRequest>
    .WithActionResult<AddBookResponse>
{
    private readonly Container _booksContainer;

    // In Program.cs, register this Container from a CosmosClient:
    // builder.Services.AddSingleton(sp =>
    // {
    //     var client = new CosmosClient(cosmosConnectionString);
    //     return client.GetContainer(databaseId: "LitClubDb", containerId: "Books");
    // });
    public Add(Container booksContainer)
    {
        _booksContainer = booksContainer;
    }

    [HttpPost("books")]
    public override async Task<ActionResult<AddBookResponse>> HandleAsync(AddBookRequest request,
        CancellationToken cancellationToken = default)
    {
        var book = new Book
        {
            id = Guid.NewGuid().ToString(),
            Title = request.Title,
            Author = request.Author,
            PublishedYear = request.PublishedYear
        };

        // Choose an appropriate partition key strategy for your app.
        // Here we use a constant; in production consider tenantId, author, or another access pattern.
        var partitionKey = new PartitionKey(book.partitionKey);

        var createResponse = await _booksContainer.CreateItemAsync(book, partitionKey, cancellationToken: cancellationToken);

        if (createResponse.StatusCode != HttpStatusCode.Created)
        {
            // Handle the error
        }

        var response = new AddBookResponse
        {
            Id = book.id,
            Title = book.Title,
            Author = book.Author,
            PublishedYear = book.PublishedYear
        };

        return CreatedAtAction(nameof(HandleAsync), new { id = book.id }, response);
    }
}
```

### Folder Structure (suggested)
```
/Features
  /Books
    /Add
      AddBookRequest.cs
      AddBookResponse.cs
      AddBookEndpoint.cs
    /GetById
    /List
    /Update
    /Delete
```
This demonstrates the REPR pattern in action: a **Request DTO**, an **Endpoint** class handling the logic, and a **Response DTO**, all dedicated to a single operation, with Cosmos DB persistence.

---

## Authentication

### Overview
The LitClub API uses a **two-phase approach**:
- **Development (no real auth yet):** the client supplies a `userId` in requests to simulate identity.
- **Production (with Azure AD / Microsoft Entra ID):** the client authenticates, receives a JWT, and sends it in the `Authorization` header. The server derives identity from token claims. The client **must stop** sending `userId` in the body.

---

### Development Authentication Strategy (Mock Phase)
- **Identity source:** Client-provided `userId` in request payloads or route params.
- **Security:** For learning and integration testing only (not production-safe).

**Example — Add Book (Client sends `userId`):**
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "publishedYear": 1925,
  "userId": "user-alpha"
}
```

**Server usage (temporary):**
```csharp
var userId = request.UserId ?? "dev-fallback"; // optional fallback during local dev
```

---

### Production Authentication Strategy (Azure AD / Microsoft Entra ID)
- **Identity source:** JWT token claims issued by Azure AD after login.
- **Client behavior:** Include the token on each request.
  
  ```http
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
  ```
- **Server configuration (Program.cs):**
  ```csharp
  builder.Services.AddAuthentication("Bearer")
      .AddJwtBearer(options =>
      {
          options.Authority = "https://login.microsoftonline.com/{tenantId}/v2.0";
          options.Audience = "api://litclub-api-id";
      });

  app.UseAuthentication();
  app.UseAuthorization();
  ```
- **Identity access in code:**
  ```csharp
  var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
  ```
- **Client request bodies:** **Must not** include `userId`. The DTOs will no longer define it; any such field is ignored or rejected by validation.

---

### Access Levels
| Endpoint Type | Example | Authentication Required | Notes |
|----------------|----------|--------------------------|-------|
| Public | `GET /books/search` | No | Publicly accessible resources |
| Semi-Public | `GET /users/{id}` | Optional | Shows limited info |
| Authenticated | `PATCH /users/{id}` | Yes | Requires valid JWT |
| Admin-Only | `DELETE /litclubs/{id}` | Yes (Admin role) | Role-based restriction |

---

### Example: AddBookRequest — Before & After

**Before (Development — client provides `userId`)**
```csharp
public class AddBookRequest
{
    public string Title { get; set; } = default!;
    public string Author { get; set; } = default!;
    public int PublishedYear { get; set; }

    // Temporary: supplied by the client during mock phase
    public string? UserId { get; set; }
}
```

**After (Production — identity from JWT; client stops sending `userId`)**
```csharp
public class AddBookRequest
{
    public string Title { get; set; } = default!;
    public string Author { get; set; } = default!;
    public int PublishedYear { get; set; }
}

// In the endpoint:
var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
```

---

### Example: Get Profile Endpoint — Before & After

**Before (Development — client supplies userId via route)**  
Route: `GET /users/{userId}`
```csharp
using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Mvc;

namespace LitClub.Api.Endpoints.Users;

public class GetProfileRequest
{
    [FromRoute] public string UserId { get; set; } = default!;
}

public class GetProfileResponse
{
    public string UserId { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string FullName { get; set; } = default!;
    public DateTime JoinedDate { get; set; }
    public int ClubsJoined { get; set; }
}

[ApiController]
public class GetProfile : EndpointBaseAsync
    .WithRequest<GetProfileRequest>
    .WithActionResult<GetProfileResponse>
{
    [HttpGet("users/{userId}")]
    public override async Task<ActionResult<GetProfileResponse>> HandleAsync(
        [FromRoute] GetProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = new GetProfileResponse
        {
            UserId = request.UserId,
            Username = "reader_joe",
            FullName = "Joe Reader",
            JoinedDate = new DateTime(2025, 1, 5),
            ClubsJoined = 3
        };

        return Ok(user);
    }
}
```

**After (Production — server derives identity from JWT)**  
Route: `GET /users/me`
```csharp
using System.Security.Claims;
using Ardalis.ApiEndpoints;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LitClub.Api.Endpoints.Users;

[Authorize]
public class GetMyProfile : EndpointBaseAsync
    .WithoutRequest
    .WithActionResult<GetProfileResponse>
{
    [HttpGet("users/me")]
    public override async Task<ActionResult<GetProfileResponse>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var user = new GetProfileResponse
        {
            UserId = userId!,
            Username = "reader_joe",
            FullName = "Joe Reader",
            JoinedDate = new DateTime(2025, 1, 5),
            ClubsJoined = 3
        };

        return Ok(user);
    }
}
```

---

### Summary
| Phase | Identity Source | Client Sends | Server Reads | DTO Shape |
|------|------------------|--------------|--------------|-----------|
| **Development** | Client-provided | `userId` in body or route | `request.UserId` | Includes `UserId` |
| **Production** | Azure AD (JWT) | `Authorization: Bearer <token>` | `User.FindFirstValue(ClaimTypes.NameIdentifier)` | `UserId` removed |

---

## API Response Guidelines

ASP.NET Core (via `ControllerBase`) provides several built-in response helpers that return the proper HTTP status codes.  
These can be used in both controllers and REPR-style endpoints.

### Common Success Responses
| Purpose | Method | HTTP |
|----------|---------|------|
| Return resource or data | `Ok(object)` | **200 OK** |
| Resource created (with link) | `CreatedAtAction(action, routeValues, value)` | **201 Created** |
| Resource created (simple) | `Created(uri, value)` | **201 Created** |
| Accepted async request | `Accepted(uri)` | **202 Accepted** |
| Successful update/delete (no body) | `NoContent()` | **204 No Content** |

### Client Errors
| Purpose | Method | HTTP |
|----------|---------|------|
| Invalid input | `BadRequest(object)` | **400 Bad Request** |
| Missing/invalid credentials | `Unauthorized()` | **401 Unauthorized** |
| Authenticated but forbidden | `Forbid()` | **403 Forbidden** |
| Resource not found | `NotFound()` | **404 Not Found** |
| Duplicate/conflict | `Conflict(object)` | **409 Conflict** |

### Server & Misc
| Purpose | Method | HTTP |
|----------|---------|------|
| Generic / custom code | `StatusCode(code, object?)` | any |

### Typical REST Mapping
| Verb | Common Responses |
|------|------------------|
| **GET** | `Ok()`, `NotFound()` |
| **POST** | `CreatedAtAction()`, `BadRequest()` |
| **PUT / PATCH** | `Ok()`, `NoContent()`, `BadRequest()` |
| **DELETE** | `NoContent()`, `NotFound()` |

### Examples
```csharp
return Ok(book);
return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
return NoContent();
return BadRequest("Invalid data.");
return NotFound();
return StatusCode(500, "Unexpected error.");
