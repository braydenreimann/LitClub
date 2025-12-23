using System.Linq;
using System.Net;
using LitClubApi.Configuration;
using LitClubApi.Domain;
using Microsoft.Azure.Cosmos;

namespace LitClubSeeder.Seeding;

using ThreadDoc = LitClubApi.Domain.Thread;

public static class SeedThreads
{
    public static async Task SeedThreadsAsync(CosmosClient client, CosmosOptions o, List<Book> books)
    {
        if (books is null || books.Count == 0)
        {
            Console.WriteLine("SeedThreads: No books provided. Skipping thread seeding.");
            return;
        }

        var threadsContainer = client.GetContainer(o.DatabaseId, o.ThreadsContainerId);
        var booksContainer = client.GetContainer(o.DatabaseId, o.BooksContainerId);

        foreach (var book in books)
        {
            // Sanity check
            if (book.TotalChapters <= 0)
            {
                Console.WriteLine($"SeedThreads: Book '{book.Title}' ({book.Id}) has no chapters (TotalChapters={book.TotalChapters}). Skipping.");
                continue;
            }

            // If the book already has a full set of chapter thread IDs, skip to avoid duplicates
            if (book.ChapterThreadIds is not null && book.ChapterThreadIds.Count >= book.TotalChapters)
            {
                Console.WriteLine($"SeedThreads: Book '{book.Title}' ({book.Id}) already has {book.ChapterThreadIds.Count} chapter threads. Skipping.");
                continue;
            }

            // Ensure the list exists
            book.ChapterThreadIds ??= new List<string>();

            // If some threads already exist, we only create the missing ones
            var existingCount = book.ChapterThreadIds.Count;
            var startChapter = existingCount + 1;

            for (int chapterNumber = startChapter; chapterNumber <= book.TotalChapters; chapterNumber++)
            {
                // "System" author for seeded threads (adjust to your real Author model as needed)
                var systemAuthor = new Author
                {
                    AuthorId = "admin",
                    Username = "LitClub Team"
                };

                var thread = new LitClubApi.Domain.Thread
                {
                    Author = systemAuthor,
                    Title = $"Chapter {chapterNumber} Discussion",
                    Body = $"Share your thoughts, reactions, and questions about Chapter {chapterNumber} of {book.Title} here.",
                    BookId = book.Id,
                    ChapterNumber = chapterNumber,
                    LitClubId = null
                };

                var response = await threadsContainer.UpsertItemAsync(thread, new PartitionKey(thread.ThreadId));
                var threadId = response.Resource.Id;

                book.ChapterThreadIds.Add(threadId);
            }

            // Persist the updated book (including ChapterThreadIds) back to Cosmos
            await booksContainer.UpsertItemAsync(book, new PartitionKey(book.Id));

        }

        Console.WriteLine("SeedThreads: Completed seeding chapter threads for all books.");
    }

    /// <summary>
    /// Sample-only seeder: generates 100 playful users and 100 comments on
    /// the Chapter 1 thread for "The Fault in Our Stars" (book id 978-0142424179).
    /// </summary>
    public static async Task SeedTheFaultInOurStarsThreadAsync(CosmosClient client, CosmosOptions o)
    {
        const string faultBookId = "978-0142424179";
        var threadsContainer = client.GetContainer(o.DatabaseId, o.ThreadsContainerId);
        var usersContainer = client.GetContainer(o.DatabaseId, o.UsersContainerId);
        var booksContainer = client.GetContainer(o.DatabaseId, o.BooksContainerId);

        Book? faultBook = null;
        try
        {
            var bookResp = await booksContainer.ReadItemAsync<Book>(faultBookId, new PartitionKey(faultBookId));
            faultBook = bookResp.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            Console.WriteLine("SeedThreads: The Fault in Our Stars book not found; skipping sample comment seeding.");
            return;
        }

        var systemAuthor = new Author { AuthorId = "admin", Username = "LitClub Team" };
        string? threadId = faultBook.ChapterThreadIds?.FirstOrDefault();
        ThreadDoc? thread = null;

        if (!string.IsNullOrWhiteSpace(threadId))
        {
            try
            {
                var threadResp = await threadsContainer.ReadItemAsync<ThreadDoc>(threadId, new PartitionKey(threadId));
                thread = threadResp.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
            {
                threadId = null;
            }
        }

        if (thread is null || string.IsNullOrWhiteSpace(threadId))
        {
            var q = new QueryDefinition(@"
SELECT TOP 1 * FROM c
WHERE c.itemType = 'thread'
  AND ((IS_DEFINED(c.bookId) AND c.bookId = @b) OR (IS_DEFINED(c.BookId) AND c.BookId = @b))
  AND ((IS_DEFINED(c.chapterNumber) AND c.chapterNumber = 1) OR (IS_DEFINED(c.ChapterNumber) AND c.ChapterNumber = 1))
  AND (NOT IS_DEFINED(c.isDeleted) OR c.isDeleted = false OR c.IsDeleted = false)")
                .WithParameter("@b", faultBookId);

            var it = threadsContainer.GetItemQueryIterator<ThreadDoc>(q, requestOptions: new QueryRequestOptions { MaxItemCount = 1 });
            if (it.HasMoreResults)
            {
                var page = await it.ReadNextAsync();
                thread = page.FirstOrDefault();
                threadId = thread?.Id;
            }
        }

        if (thread is null || string.IsNullOrWhiteSpace(threadId))
        {
            var newThread = new ThreadDoc
            {
                Author = systemAuthor,
                Title = "Chapter 1 Discussion",
                Body = "Hazel meets Augustus. Oxygen tanks, oblivion rants, and a grenade metaphor - talk about a cold open.",
                BookId = faultBookId,
                ChapterNumber = 1,
                LitClubId = null,
                Score = 78
            };

            var response = await threadsContainer.UpsertItemAsync(newThread, new PartitionKey(newThread.ThreadId));
            thread = response.Resource;
            threadId = thread.Id;

            faultBook.ChapterThreadIds ??= new List<string>();
            if (!faultBook.ChapterThreadIds.Contains(threadId))
            {
                faultBook.ChapterThreadIds.Insert(0, threadId);
                await booksContainer.UpsertItemAsync(faultBook, new PartitionKey(faultBook.Id));
            }
        }

        // 100 playful users with sample profile photos
        var random = new Random(42);
        var firstNames = new[]
        {
            "Hazel", "August", "Isaac", "Nova", "Mara", "Felix", "Rowan", "Indigo", "Lark", "Sage",
            "Cleo", "Jules", "Rafi", "Arden", "Piper", "Leo", "Aster", "Quinn", "Milo", "Opal",
            "Skye", "Tamsin", "Atlas", "Ezra", "Lena", "Cass", "Finch", "Wren", "Silas", "Novae"
        };
        var lastNames = new[]
        {
            "Waters", "Lancaster", "Shields", "Blake", "Hayes", "Lopez", "Patel", "Nguyen", "Kim", "Yazzie",
            "Rivera", "Stone", "Brooks", "Vale", "Hart", "Dunn", "Kaur", "Young", "Keane", "Bennett"
        };
        var vibeParts = new[]
        {
            "Bookish", "Sarcastic", "Starry", "LoFi", "Understated", "Cheeky", "Anxious", "Soft", "Chaotic", "Stoic",
            "Nerdfight", "Caffeinated", "Mellow", "Astro", "Salty", "Earnest", "Oddball", "Punny", "Sincere", "Sleepy"
        };
        var critters = new[]
        {
            "Otter", "Moth", "Raven", "Pigeon", "Ferret", "Badger", "Guppy", "Heron", "Koi", "Fox",
            "Capy", "Gecko", "Ibis", "Hawk", "Mink", "Wombat", "Panda", "Lynx", "Goose", "Sloth"
        };
        var bios = new[]
        {
            "Reads sad books to feel something and then eats ice cream.",
            "If a character is witty and doomed, I'm invested.",
            "Annotates paperbacks like they're lab notebooks.",
            "Here for the metaphors, stay for the banter.",
            "I bring tissues to book club like it's BYO.",
            "Copes with existential dread using margins and highlighters.",
            "Believes humor is a survival strategy.",
            "Collects first lines of novels like Pokemon cards.",
            "Friendly neighborhood YA critic and meme courier.",
            "I read the acknowledgements, fight me."
        };
        var pronounPool = new[] { "she/her", "he/him", "they/them" };
        var genrePool = new[] { "YA", "Romance", "Sci-Fi", "Poetry", "Memoir", "Fantasy", "Nonfiction", "Philosophy", "Humor" };
        var profilePhotos = new[]
        {
            "augustus.jpeg",
            "hank-green.jpg",
            "hazel.png",
            "hermione-granger.jpg",
            "john-green.png",
            "katniss-everdeen.jpg",
            "severus-snape.jpeg",
            "steve-jobs-headshot.jpg"
        };
        var profileRandom = new Random(137);

        var seededUsers = new List<LitClubUser>(capacity: 100);
        for (int i = 0; i < 100; i++)
        {
            var handle = $"{vibeParts[i % vibeParts.Length]}{critters[(i + 3) % critters.Length]}{i + 1}";
            var first = firstNames[i % firstNames.Length];
            var last = lastNames[(i + (i / 7)) % lastNames.Length];
            var pronoun = pronounPool[i % pronounPool.Length];
            var g1 = genrePool[(i + 2) % genrePool.Length];
            var g2 = genrePool[(i + 5) % genrePool.Length];

            seededUsers.Add(new LitClubUser
            {
                Id = $"fault-seed-user-{i + 1}",
                FirstName = first,
                LastName = last,
                UserName = handle.ToLowerInvariant(),
                Email = $"{handle.ToLowerInvariant()}@example.com",
                PasswordHash = $"fault-seed-pw-{i + 1}",
                Bio = bios[i % bios.Length],
                Pronouns = [pronoun],
                ProfilePhotoUrl = profilePhotos[profileRandom.Next(profilePhotos.Length)],
                PreferredGenres = [g1, g2]
            });
        }

        foreach (var user in seededUsers)
        {
            await usersContainer.UpsertItemAsync(user, new PartitionKey(user.Id));
        }

        // Build 100 comments (mix of sincere and irreverent) for chapter 1
        var openingLines = new[]
        {
            "Hazel calling herself a grenade in chapter one knocked the wind out of me.",
            "Augustus steals the spotlight without saying much - peak John Green energy.",
            "The literal heart monitor metaphor is subtle and also not subtle.",
            "Support group in a church basement is the most YA thing but also weirdly tender.",
            "Van Houten being foreshadowed this early is wild if you know you know.",
            "Every time they say 'lit up by Jesus' I cackle.",
            "Isaac's video game trash talk is elite.",
            "Hazel's mom hovering with the car keys is so real.",
            "As someone who did chemo, the humor here feels like oxygen.",
            "This chapter reads like a vlog before vlogs existed.",
            "The grenade monologue is heavier than most finales and it's page twelve.",
            "Reading this on a bus was a mistake; now I'm crying next to commuters.",
            "This is the most Tumblr-coded dialogue and I mean that lovingly.",
            "The cigarette metaphor is both cringe and iconic.",
            "The oblivion rant had me thinking about Camus in a YA novel, lol.",
            "Page one and we're already debating infinities, calm down nerds.",
            "Love how Hazel weaponizes sarcasm as a shield and a handshake.",
            "The word 'literally' count is high and my inner editor is twitching.",
            "Augustus naming his fears like they're Pokemon is hilarious.",
            "The pacing is so fast I'm convinced this chapter is a TikTok."
        };

        var closingTags = new[]
        {
            "Also the swing set line hits like a freight train.",
            "I forgot how funny terminal teenagers can be when written well.",
            "Somebody please check on Isaac; he's carrying the comic relief.",
            "Hazel's parents feel like real people, not cardboard scenery.",
            "Every other line is quote-tweet material.",
            "This is YA that wants to be philosophy class and I'm here for it.",
            "My inner 17-year-old is screaming and my adult self is taking notes.",
            "The banter is dopamine and dread at the same time.",
            "I can't decide if the cigarette is edgy or just deeply try-hard.",
            "John Green speedruns the reader's empathy like it's Any%.",
            "Also the title drop setup is already forming; sneaky.",
            "Someone tell these kids therapy exists outside a church basement.",
            "If this doesn't end well I'm suing emotions.",
            "Hazel's mom deserves a chapter of her own.",
            "The dialogue is so sharp it should come with a warning label."
        };

        var replyLines = new[]
        {
            "Replying as someone with asthma: Hazel's humor is peak survival.",
            "The grenade metaphor is why I hand out tissues when recommending this book.",
            "I snort-laughed at 'Literal Heart of Jesus' even though I probably shouldn't.",
            "Oblivion is real but so is mortgage - perspective, Augustus.",
            "The cigarette metaphor is the YA equivalent of Chekhov's gun.",
            "Isaac deserves a spin-off of trash-talk and poetry.",
            "Hazel's mom is the stealth MVP, fight me.",
            "Reading this while sick: please respect naps, Hazel.",
            "Can't believe I'm rooting for a side character's eyeballs.",
            "If teenagers talked like this in my high school, I'd have actually gone.",
            "This chapter is why nerdfighteria exists - change my mind.",
            "I want to print the oblivion rant and hand it to my existential dread.",
            "Lol at the 'literally' count; John Green heard the feedback and said more.",
            "Someone teach Augustus to shuffle cards; metaphor prevention.",
            "These kids could run a group chat that cures boredom.",
            "Does the swing set get a redemption arc? Asking for tears.",
            "The cancer perks bit is dark and hilarious.",
            "Isaac's blind rage jokes are both foreshadowing and chaos.",
            "Hazel's narration feels like a DM you'd send at 2 a.m.",
            "I forgot how much this book roasts oblivion and still makes it cute."
        };

        const int topLevelCount = 60;
        const int replyCount = 40;
        var topLevelComments = new List<Comment>(capacity: topLevelCount);

        for (int i = 0; i < topLevelCount; i++)
        {
            var authorUser = seededUsers[i % seededUsers.Count];
            var opener = openingLines[i % openingLines.Length];
            var closer = closingTags[(i * 3 + i) % closingTags.Length];
            var playfulTag = (i % 10 == 0) ? " Also, who let me relate this hard?" : string.Empty;

            topLevelComments.Add(new Comment
            {
                Id = Guid.NewGuid().ToString(),
                ThreadId = threadId!,
                Author = new Author
                {
                    AuthorId = authorUser.Id,
                    Username = authorUser.UserName,
                    ProfilePhotoUrl = authorUser.ProfilePhotoUrl
                },
                Body = $"{opener} {closer}{playfulTag}",
                ParentCommentId = null,
                Score = random.Next(-1, 15),
                ReplyCount = 0
            });
        }

        var replyComments = new List<Comment>(capacity: replyCount);
        for (int i = 0; i < replyCount; i++)
        {
            var parent = topLevelComments[i % topLevelComments.Count];
            var authorUser = seededUsers[(i + 25) % seededUsers.Count];
            var line = replyLines[i % replyLines.Length];

            replyComments.Add(new Comment
            {
                Id = Guid.NewGuid().ToString(),
                ThreadId = threadId!,
                Author = new Author
                {
                    AuthorId = authorUser.Id,
                    Username = authorUser.UserName,
                    ProfilePhotoUrl = authorUser.ProfilePhotoUrl
                },
                Body = line,
                ParentCommentId = parent.Id,
                Score = random.Next(-1, 9),
                ReplyCount = 0
            });

            parent.ReplyCount++;
        }

        var allComments = topLevelComments.Concat(replyComments).ToList();
        foreach (var c in allComments)
        {
            await threadsContainer.UpsertItemAsync(c, new PartitionKey(threadId!));
        }

        // Update thread counters for visibility
        thread!.CommentCount += allComments.Count;
        thread.Updated = DateTime.UtcNow;
        await threadsContainer.UpsertItemAsync(thread, new PartitionKey(threadId!));

        Console.WriteLine($"SeedThreads: Seeded {seededUsers.Count} users and {allComments.Count} comments for '{faultBookId}' chapter 1.");
    }
}
