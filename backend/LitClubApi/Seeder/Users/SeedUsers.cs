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
                        // The Fault in Our Stars
                        BookId = "978-0142424179",
                        Status = ShelfStatus.pastReads,
                    },
                    new LibraryBook()
                    {
                        // Steve Jobs
                        BookId = "978-1451648539",
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        // The Anxious Generation
                        BookId = "978-0593655030",
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        // Ultra-Processed People
                        BookId = "978-1324076261",
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        // Dawn of the New Everything
                        BookId = "978-1847923523",
                        Status = ShelfStatus.pastReads,
                    },
                    new LibraryBook()
                    {
                        // If Anyone Builds It, Everyone Dies
                        BookId = "978-0316595643",
                        Status = ShelfStatus.currentlyReading,
                    },
                    new LibraryBook()
                    {
                        // It's OK to Be Angry About Capitalism
                        BookId = "978-0593238714",
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