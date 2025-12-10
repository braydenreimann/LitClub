using LitClubApi.Configuration;
using LitClubApi.Domain;
using Microsoft.Azure.Cosmos;

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

            //Console.WriteLine($"SeedThreads: Seeding chapter threads for '{book.Title}' ({book.Id}) starting at chapter {startChapter} of {book.TotalChapters}.");

            for (int chapterNumber = startChapter; chapterNumber <= book.TotalChapters; chapterNumber++)
            {
                // "System" author for seeded threads (adjust to your real Author model as needed)
                var systemAuthor = new Author
                {
                    AuthorId = "system",
                    Username = "system"
                };

                var thread = new LitClubApi.Domain.Thread
                {
                    Author = systemAuthor,
                    Title = $"{book.Title} – Chapter {chapterNumber}",
                    Body = $"Discussion thread for **{book.Title}**, Chapter {chapterNumber}.",
                    BookId = book.Id,
                    ChapterNumber = chapterNumber,
                    LitClubId = null
                };

                var response = await threadsContainer.UpsertItemAsync(thread, new PartitionKey(thread.ThreadId));
                var threadId = response.Resource.Id;

                book.ChapterThreadIds.Add(threadId);

                //Console.WriteLine($"SeedThreads: Created thread '{thread.Title}' with Id={threadId} for chapter {chapterNumber}.");
            }

            // Persist the updated book (including ChapterThreadIds) back to Cosmos
            await booksContainer.UpsertItemAsync(book, new PartitionKey(book.Id));

            //Console.WriteLine($"SeedThreads: Updated Book '{book.Title}' ({book.Id}) with {book.ChapterThreadIds.Count} chapter thread IDs.");
        }

        Console.WriteLine("SeedThreads: Completed seeding chapter threads for all books.");
    }
}