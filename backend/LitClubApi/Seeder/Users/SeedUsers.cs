using LitClubApi.Configuration;
using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;

public static class SeedUsers
{
    public static async Task SeedUsersAsync(CosmosClient client, CosmosOptions o, List<Book> books)
    {
        var usersContainer = client.GetContainer(o.DatabaseId, o.UsersContainerId);

        List<LitClubUser> users =
        [
            new LitClubUser {
                Id = "10",
                FirstName = "Brayden",
                LastName = "Reimann",
                UserName = "braydenreimann",
                Email = "braydenreimann@icloud.com",
                PasswordHash = "brpw",
                Bio = "I enjoy books that sit at the intersection of technology and philosophy.",
                PreferredGenres = ["Nonfiction"],
                ProfilePhotoUrl = "severus-snape.jpg",
                }
        ];

        // Insert each user into the usersContainer
        foreach (var user in users)
        {
            await usersContainer.UpsertItemAsync(user, new PartitionKey(user.Id));

        }

        var libariesContainer = client.GetContainer(o.DatabaseId, o.LibrariesContainerId);

        List<Library> libraries =
        [
            new Library {
                OwnerId = users[0].Id,
                LibraryBooks =
                [
                    new LibraryBook()
                    {
                        BookId = books.FirstOrDefault(b => string.Equals(b.Title, "steve jobs", StringComparison.OrdinalIgnoreCase))?.Id ?? string.Empty,
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        BookId = books.FirstOrDefault(b => string.Equals(b.Title, "the anxious generation", StringComparison.OrdinalIgnoreCase))?.Id ?? string.Empty,
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        BookId = books.FirstOrDefault(b => string.Equals(b.Title, "ultra-processed people", StringComparison.OrdinalIgnoreCase))?.Id ?? string.Empty,
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        BookId = books.FirstOrDefault(b => string.Equals(b.Title, "dawn of the new everything", StringComparison.OrdinalIgnoreCase))?.Id ?? string.Empty,
                        Status = ShelfStatus.pastReads,
                    },
                    new LibraryBook()
                    {
                        BookId = books.FirstOrDefault(b => string.Equals(b.Title, "if anyone builds it, everyone dies", StringComparison.OrdinalIgnoreCase))?.Id ?? string.Empty,
                        Status = ShelfStatus.currentlyReading,
                    },
                    new LibraryBook()
                    {
                        BookId = books.FirstOrDefault(b => string.Equals(b.Author, "Bernie Sanders"))?.Id ?? string.Empty,
                        Status = ShelfStatus.futureReads,
                    }
                ]
            }
        ];

        // Insert a library for each user into the librariesContainer
        foreach (var library in libraries)
        {
            await libariesContainer.UpsertItemAsync(library, new PartitionKey(library.OwnerId));
        }
    }
}