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

Container usersContainer = await database.CreateContainerIfNotExistsAsync(
    id: "users",
    partitionKeyPath: "/id"
);

Container litClubsContainer = await database.CreateContainerIfNotExistsAsync(
    id: "litclubs",
    partitionKeyPath: "/id"
);

Container librariesContainer = await database.CreateContainerIfNotExistsAsync(
    id: "libraries",
    partitionKeyPath: "/id"
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

LitClubUser litClubUser = new()
{
    Id = "1",
    FirstName = "John",
    LastName = "Green",
    UserName = "johngreen",
    Email = "johngreen@icloud.com",
    PasswordHash = "johngreenpw",
    Bio = "I'm just a Nerdfighter that loves reading and science",
    PreferredGenres = ["Fiction"],
};

LitClub litClub = new()
{
    Id = "1",
    Name = "Fans of John Green",
    OwnerUserId = "1",
    Description = "We love all of John Green's books. And some of Hank's too.",
    MemberUserIds = ["1"],
};

await booksContainer.UpsertItemAsync(book, new PartitionKey(book.Id));
await usersContainer.UpsertItemAsync(litClubUser, new PartitionKey(litClubUser.Id));
await litClubsContainer.UpsertItemAsync(litClub, new PartitionKey(litClub.Id));

Library library = new()
{
    UserId = "Steve Bookreader",
    LibraryBooks = []
};

await librariesContainer.UpsertItemAsync(library, new PartitionKey(library.UserId));

// Add service to container
builder.Services.AddSingleton(booksContainer);
builder.Services.AddSingleton(librariesContainer);
builder.Services.AddSingleton(usersContainer);
builder.Services.AddSingleton(litClubsContainer);

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
