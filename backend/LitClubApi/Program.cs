using LitClubApi.Domain;
using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure the client's options to disable TSL/SSL validation before creating the client
CosmosClientOptions options = new()
{
    HttpClientFactory = () => new HttpClient(new HttpClientHandler()
    {
        ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
    }),
    ConnectionMode = ConnectionMode.Gateway
};

// Create a new instance of CosmosClient using the emulator's credentials
using CosmosClient client = new(
    accountEndpoint: "https://localhost:8081",
    authKeyOrResourceToken: "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==",
    clientOptions: options
);

// Create a new database and container
Database database = await client.CreateDatabaseIfNotExistsAsync(
    id: "litclub",
    throughput: 400
);

Container booksContainer = await database.CreateContainerIfNotExistsAsync(
    id: "books",
    partitionKeyPath: "/id"
);

Container LibraryContainer = await database.CreateContainerIfNotExistsAsync(
    id: "libraries",
    partitionKeyPath: "/userId"
);

// Seed the database
Book book = new()
{
    Id = "1",
    Title = "The Fault in Our Stars",
    Author = "John Green",
    TotalChapters = 25,
    Genre = "Young adult novel",
    Description = "A book about two sick young lovers.",
    Editions = [
        new Edition {
            Format = BookFormat.Paperback,
            Publisher = "Penguin Books",
            PublicationDate = DateOnly.Parse("April 8, 2014"),
            PrintLength = 352,
            Isbn13s = ["978-0142424179"]
        }
    ]
};

await booksContainer.UpsertItemAsync(book, new PartitionKey(book.Id));

Library library = new()
{
    UserId = "Steve Bookreader",
    Books = []
};

// Add service to container
builder.Services.AddSingleton(booksContainer);
builder.Services.AddSingleton(LibraryContainer);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();