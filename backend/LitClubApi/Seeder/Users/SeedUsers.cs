using LitClubApi.Configuration;
using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;
using System.Linq;

public static class SeedUsers
{
    public static async Task SeedUsersAsync(CosmosClient client, CosmosOptions o, List<Book> books)
    {
        var usersContainer = client.GetContainer(o.DatabaseId, o.UsersContainerId);
        var litclubsContainer = client.GetContainer(o.DatabaseId, o.LitClubsContainerId);
        var librariesContainer = client.GetContainer(o.DatabaseId, o.LibrariesContainerId);

        List<LitClubUser> users =
        [
            new LitClubUser {
                Id = "1",
                FirstName = "Brayden",
                LastName = "Reimann",
                UserName = "braydenreimann",
                Email = "braydenreimann@icloud.com",
                PasswordHash = "brpw",
                Bio = "I enjoy books that sit at the intersection of technology and philosophy.",
                PreferredGenres = ["Nonfiction"],
                ProfilePhotoUrl = "severus-snape.jpeg"
            },
            new LitClubUser {
                Id = "2",
                FirstName = "John",
                LastName = "Green",
                UserName = "johngreen",
                Email = "johngreen@icloud.com",
                PasswordHash = "johngreenpw",
                Bio = "I'm a highly celebrated author and leader of the Nerdfighters.",
                PreferredGenres = ["Fiction"],
                ProfilePhotoUrl = "john-green.png"
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
                    },
                    new LibraryBook()
                    {
                        // Everything is Tuberculosis
                        BookId = "978-0525556572",
                        Status = ShelfStatus.futureReads,
                        OnPedastal = true
                    },
                ]
            },
            new Library {
                OwnerId = users[1].Id,
                LibraryBooks =
                [
                    new LibraryBook()
                    {
                        // Everything is Tuberculosis
                        BookId = "978-0525556572",
                        Status = ShelfStatus.pastReads,
                        OnPedastal = true
                    },
                    new LibraryBook()
                    {
                        // The Fault in Our Stars
                        BookId = "978-0142424179",
                        Status = ShelfStatus.pastReads,
                        OnPedastal = false
                    },
                    new LibraryBook()
                    {
                        // If Anyone Builds It, Everyone Dies
                        BookId = "978-0316595643",
                        Status = ShelfStatus.currentlyReading,
                    },
                    new LibraryBook()
                    {
                        // The Goldfinch
                        BookId = "978-0316055437",
                        Status = ShelfStatus.futureReads
                    },
                    new LibraryBook()
                    {
                        // The Underground Railroad
                        BookId = "978-0385542364",
                        Status = ShelfStatus.futureReads
                    }
                ]
            }
        ];

        // Insert a library for each user into the librariesContainer
        foreach (var library in libraries)
        {
            await libariesContainer.UpsertItemAsync(library, new PartitionKey(library.OwnerId));
        }

        // Define two LitClubs
        var litclub1 = new LitClub()
        {
            Name = "Brayden's LitClub",
            OwnerUserId = users[0].Id,
            OwnerUserName = "braydenreimann",
            Description = "In Brayden's LitClub, we discuss books that sit a the intersection of technology and philosophy.",
            MemberUserIds = [users[0].Id], // seed owner as member so threads surface
        };

        var litclub2 = new LitClub()
        {
            Name = "Nerdfighters",
            OwnerUserId = users[1].Id,
            OwnerUserName = "johngreen",
            Description = "We are Nerdfighteria. Join us if you dare to make the world a better (and more educated) place!",
            MemberUserIds = [users[1].Id], // seed owner membership
        };

        // Insert the litclubs into the litClubs container
        await litclubsContainer.UpsertItemAsync(litclub1, new PartitionKey(litclub1.Id));
        await litclubsContainer.UpsertItemAsync(litclub2, new PartitionKey(litclub2.Id));

        // LitClub libraries
        var litclub1Library = new Library
        {
            OwnerId = litclub1.Id,
            LibraryBooks =
            [
                new LibraryBook() { BookId = "978-0142424179", Status = ShelfStatus.pastReads },
                new LibraryBook() { BookId = "978-1451648539", Status = ShelfStatus.pastReads, OnPedastal = true },
                new LibraryBook() { BookId = "978-0593655030", Status = ShelfStatus.pastReads, OnPedastal = true },
                new LibraryBook() { BookId = "978-1324076261", Status = ShelfStatus.pastReads, OnPedastal = true },
                new LibraryBook() { BookId = "978-1847923523", Status = ShelfStatus.pastReads },
                new LibraryBook() { BookId = "978-0316595643", Status = ShelfStatus.currentlyReading },
                new LibraryBook() { BookId = "978-0593238714", Status = ShelfStatus.futureReads },
                new LibraryBook() { BookId = "978-0525556572", Status = ShelfStatus.futureReads, OnPedastal = true },
            ]
        };

        var litclub2Library = new Library
        {
            OwnerId = litclub2.Id,
            LibraryBooks =
            [
                new LibraryBook() { BookId = "978-0525556572", Status = ShelfStatus.pastReads, OnPedastal = true },
                new LibraryBook() { BookId = "978-0142424179", Status = ShelfStatus.pastReads },
                new LibraryBook() { BookId = "978-0316595643", Status = ShelfStatus.currentlyReading },
                new LibraryBook() { BookId = "978-0316055437", Status = ShelfStatus.futureReads },
                new LibraryBook() { BookId = "978-0385542364", Status = ShelfStatus.futureReads },
            ]
        };

        // Insert the libraries into the libraries container
        await librariesContainer.UpsertItemAsync(litclub1Library, new PartitionKey(litclub1Library.OwnerId));
        await librariesContainer.UpsertItemAsync(litclub2Library, new PartitionKey(litclub2Library.OwnerId));

        // Seed litclub chapter threads for books that are currently reading or past reads.
        var threadsContainer = client.GetContainer(o.DatabaseId, o.ThreadsContainerId);
        var systemAuthor = new Author { AuthorId = "admin", Username = "LitClub Team" };

        async Task SeedChapterThreadsForLibraryAsync(Library lib, LitClub club)
        {
            foreach (var libraryBook in lib.LibraryBooks.Where(lb =>
                         lb.Status == ShelfStatus.currentlyReading || lb.Status == ShelfStatus.pastReads))
            {
                var book = books.FirstOrDefault(b => b.Id == libraryBook.BookId);
                if (book is null || book.TotalChapters <= 0) continue;

                for (int chapterNumber = 1; chapterNumber <= book.TotalChapters; chapterNumber++)
                {
                    var deterministicThreadId = $"{book.Id}:{club.Id}:chapter:{chapterNumber}";

                    var thread = new LitClubApi.Domain.Thread
                    {
                        Id = deterministicThreadId,
                        Author = systemAuthor,
                        Title = $"Chapter {chapterNumber} Discussion",
                        Body = $"Share your thoughts, reactions, and questions about Chapter {chapterNumber} of {book.Title} with other members of {club.Name} here.",
                        BookId = book.Id,
                        LitClubId = club.Id,
                        ChapterNumber = chapterNumber
                    };

                    await threadsContainer.UpsertItemAsync(
                        thread,
                        new PartitionKey(thread.Id));
                }
            }
        }

        await SeedChapterThreadsForLibraryAsync(litclub1Library, litclub1);
        await SeedChapterThreadsForLibraryAsync(litclub2Library, litclub2);
    }
}
