/* begin SeedThreads.cs */

using Microsoft.Azure.Cosmos;
using LitClubApi.Domain;
using LitClubApi.Configuration;

public static class SeedThreads
{
    public static async Task SeedFaultInOurStarsForumAsync(CosmosClient client, CosmosOptions o)
    {
        var container = client.GetContainer(o.DatabaseId, o.ThreadsContainerId);

        // Admin (thread author)
        Author adminAuthor = new()
        {
            AuthorId = "admin",
            Username = "LitClub Team"
        };

        // 10 sample users
        List<Author> authors =
        [
            new Author { AuthorId = "u100", Username = "booklover92",     ProfilePhotoUrl = null },
            new Author { AuthorId = "u101", Username = "readwithme",      ProfilePhotoUrl = null },
            new Author { AuthorId = "u102", Username = "page_turner",     ProfilePhotoUrl = null },
            new Author { AuthorId = "u103", Username = "lit_addict",      ProfilePhotoUrl = null },
            new Author { AuthorId = "u104", Username = "novel_ninja",     ProfilePhotoUrl = null },
            new Author { AuthorId = "u105", Username = "storytime_sam",   ProfilePhotoUrl = null },
            new Author { AuthorId = "u106", Username = "chapter_chaser",  ProfilePhotoUrl = null },
            new Author { AuthorId = "u107", Username = "fiction_fiend",   ProfilePhotoUrl = null },
            new Author { AuthorId = "u108", Username = "quill_quest",     ProfilePhotoUrl = null },
            new Author { AuthorId = "u109", Username = "midnight_reader", ProfilePhotoUrl = null },
        ];

        // 25 GLOBAL chapter threads (My Library)
        // Ensure: BookId = "1", AfterChapter = ChapterNumber, LitClubId = null
        var chapterThreads = new List<LitClubApi.Domain.Thread>
        {
            new LitClubApi.Domain.Thread
            {
                Id = "thread-1",
                Author = adminAuthor,
                Title = "Chapter 1 Discussion",
                Body = "Chapter Title: A Support Group and a Boy\n\nChapter Summary: Hazel, a sixteen-year-old cancer patient living on borrowed time, reluctantly attends a church basement support group at her mother’s urging. Expecting the usual monotony, she instead meets the charismatic Augustus Waters — a charming amputee with a mischievous smile. Their immediate connection sparks something Hazel hasn’t felt in a long time: curiosity…and maybe even hope.",
                BookId = "1",
                AfterChapter = 1,
                ChapterNumber = 1,
                LitClubId = null,
                Score = 552
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-2",
                Author = adminAuthor,
                Title = "Chapter 2 Discussion",
                Body = "Chapter Title: Shared Stories\n\nChapter Summary: Hazel and Augustus begin to learn more about one another, bonding over books, fears, and the brutal honesty of illness. Hazel shares her obsession with *An Imperial Affliction*, a novel that seems to understand her life better than people do — leaving Augustus intrigued.",
                BookId = "1",
                AfterChapter = 2,
                ChapterNumber = 2,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-3",
                Author = adminAuthor,
                Title = "Chapter 3 Discussion",
                Body = "Chapter Title: A Swap of Favorite Books\n\nChapter Summary: A swap of favorite books deepens Hazel and Augustus’ connection. Augustus promises to read *An Imperial Affliction*, while Hazel reluctantly agrees to read his favorite novel, *The Price of Dawn*. Their budding friendship begins to feel like something more.",
                BookId = "1",
                AfterChapter = 3,
                ChapterNumber = 3,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-4",
                Author = adminAuthor,
                Title = "Chapter 4 Discussion",
                Body = "Chapter Title: Opening Up\n\nChapter Summary: A small favor turns into a vulnerable moment as Hazel and Augustus spend more time together. Augustus reveals the truth about his past relationship, and Hazel opens up about the pain cancer has carved into her life — emotionally more than physically.",
                BookId = "1",
                AfterChapter = 4,
                ChapterNumber = 4,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-5",
                Author = adminAuthor,
                Title = "Chapter 5 Discussion",
                Body = "Chapter Title: Literary Differences\n\nChapter Summary: After finishing Augustus’ book, Hazel rants passionately about its absurd, action-packed plot. Their literary exchange brings them closer, revealing how differently they process trauma, loss, and escapism — yet how perfectly they complement each other.",
                BookId = "1",
                AfterChapter = 5,
                ChapterNumber = 5,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-6",
                Author = adminAuthor,
                Title = "Chapter 6 Discussion",
                Body = "Chapter Title: The Grenade Theory\n\nChapter Summary: Hazel’s health becomes a larger concern, and she grows fearful of getting too close to Augustus — worried she is a 'grenade' waiting to explode. Augustus pushes back, determined to choose their connection, no matter the risk.",
                BookId = "1",
                AfterChapter = 6,
                ChapterNumber = 6,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-7",
                Author = adminAuthor,
                Title = "Chapter 7 Discussion",
                Body = "Chapter Title: Isaac’s Breakdown\n\nChapter Summary: Isaac faces heartbreak when his girlfriend breaks up with him before his surgery, leaving Hazel and Augustus to comfort him — with some chaotic, dark-humor-filled therapy along the way. Their trio dynamic strengthens.",
                BookId = "1",
                AfterChapter = 7,
                ChapterNumber = 7,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-8",
                Author = adminAuthor,
                Title = "Chapter 8 Discussion",
                Body = "Chapter Title: The Wish\n\nChapter Summary: Augustus surprises Hazel big-time: he uses his one remaining Wish to take her to Amsterdam so she can meet the mysterious author of *An Imperial Affliction*. Hazel is stunned — and her feelings for him grow harder to deny.",
                BookId = "1",
                AfterChapter = 8,
                ChapterNumber = 8,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-9",
                Author = adminAuthor,
                Title = "Chapter 9 Discussion",
                Body = "Chapter Title: ICU Scare\n\nChapter Summary: A health scare lands Hazel in the ICU. While recovering, she questions whether love is worth the inevitable pain she fears she will cause. Yet Augustus remains constant — a presence she can’t ignore.",
                BookId = "1",
                AfterChapter = 9,
                ChapterNumber = 9,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-10",
                Author = adminAuthor,
                Title = "Chapter 10 Discussion",
                Body = "Chapter Title: Permission to Hope\n\nChapter Summary: Hazel’s trip approval clears with conditions, and her parents reluctantly support her wish to go to Amsterdam. A new, thrilling chapter in her life — one beyond hospitals and support groups — begins to take shape.",
                BookId = "1",
                AfterChapter = 10,
                ChapterNumber = 10,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-11",
                Author = adminAuthor,
                Title = "Chapter 11 Discussion",
                Body = "Chapter Title: Amsterdam Arrival\n\nChapter Summary: Arrival in Amsterdam! Hazel and Augustus enjoy unforgettable first moments abroad — fancy restaurants, stunning sights, and a rare sense of teenage normalcy. Sparks are very much flying.",
                BookId = "1",
                AfterChapter = 11,
                ChapterNumber = 11,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-12",
                Author = adminAuthor,
                Title = "Chapter 12 Discussion",
                Body = "Chapter Title: Meeting Van Houten\n\nChapter Summary: Hazel finally meets Peter Van Houten, the author she idolized — only to discover he is drunk, bitter, and cruel. The encounter shatters her expectations, leaving her emotionally devastated.",
                BookId = "1",
                AfterChapter = 12,
                ChapterNumber = 12,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-13",
                Author = adminAuthor,
                Title = "Chapter 13 Discussion",
                Body = "Chapter Title: Anne Frank House\n\nChapter Summary: Picking up the pieces after Van Houten’s meltdown, Hazel and Augustus make the most of Amsterdam. A magical day at the Anne Frank House brings them closer than ever — including a kiss that sparks applause.",
                BookId = "1",
                AfterChapter = 13,
                ChapterNumber = 13,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-14",
                Author = adminAuthor,
                Title = "Chapter 14 Discussion",
                Body = "Chapter Title: First Love\n\nChapter Summary: Hazel and Augustus share intimate, honest moments about life, fear, and love. Their relationship becomes real — and beautifully vulnerable — as they choose each other despite uncertainty.",
                BookId = "1",
                AfterChapter = 14,
                ChapterNumber = 14,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-15",
                Author = adminAuthor,
                Title = "Chapter 15 Discussion",
                Body = "Chapter Title: The News\n\nChapter Summary: The joy of Amsterdam is pierced by a heartbreaking reveal: Augustus’ cancer has returned — aggressively. Hazel’s world tilts, and the emotional balance of their relationship shifts.",
                BookId = "1",
                AfterChapter = 15,
                ChapterNumber = 15,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-16",
                Author = adminAuthor,
                Title = "Chapter 16 Discussion",
                Body = "Chapter Title: Role Reversal\n\nChapter Summary: Back home, Hazel becomes Augustus’ support system as his health declines. Their roles reverse, testing the strength of their love and the promises they made to one another.",
                BookId = "1",
                AfterChapter = 16,
                ChapterNumber = 16,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-17",
                Author = adminAuthor,
                Title = "Chapter 17 Discussion",
                Body = "Chapter Title: The Pre-Funeral\n\nChapter Summary: Augustus begins pre-funeral planning, asking Hazel and Isaac to write eulogies for him. The trio faces mortality head-on, mixing humor and heartbreak in a way only they can.",
                BookId = "1",
                AfterChapter = 17,
                ChapterNumber = 17,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-18",
                Author = adminAuthor,
                Title = "Chapter 18 Discussion",
                Body = "Chapter Title: Hazel’s Eulogy\n\nChapter Summary: Hazel delivers her eulogy to Augustus privately — raw, honest, and deeply emotional. Their love story reaches a devastatingly beautiful turning point.",
                BookId = "1",
                AfterChapter = 18,
                ChapterNumber = 18,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-19",
                Author = adminAuthor,
                Title = "Chapter 19 Discussion",
                Body = "Chapter Title: Goodbye, Augustus\n\nChapter Summary: Augustus passes away, leaving Hazel heartbroken but forever changed. The reality of loss hits with full force as she navigates grief, memories, and love that refuses to fade.",
                BookId = "1",
                AfterChapter = 19,
                ChapterNumber = 19,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-20",
                Author = adminAuthor,
                Title = "Chapter 20 Discussion",
                Body = "Chapter Title: The Funeral\n\nChapter Summary: Hazel struggles through the funeral and the aftermath, surrounded by people who never understood Augustus the way she did. Isaac provides comfort with brutal, loving honesty.",
                BookId = "1",
                AfterChapter = 20,
                ChapterNumber = 20,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-21",
                Author = adminAuthor,
                Title = "Chapter 21 Discussion",
                Body = "Chapter Title: Unfinished Business\n\nChapter Summary: Hazel seeks closure but finds frustration when Van Houten reenters her life unexpectedly. Answers remain elusive, but an important truth begins to emerge.",
                BookId = "1",
                AfterChapter = 21,
                ChapterNumber = 21,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-22",
                Author = adminAuthor,
                Title = "Chapter 22 Discussion",
                Body = "Chapter Title: The Missing Pages\n\nChapter Summary: Isaac reveals that Augustus had been writing something for Hazel before he died. A new mystery builds — one that might hold the kind of closure Hazel desperately needs.",
                BookId = "1",
                AfterChapter = 22,
                ChapterNumber = 22,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-23",
                Author = adminAuthor,
                Title = "Chapter 23 Discussion",
                Body = "Chapter Title: Augustus’ Words\n\nChapter Summary: Hazel tracks down the missing pages of Augustus’ writing. Her love for him — and his love for her — lives on through words that continue to change her.",
                BookId = "1",
                AfterChapter = 23,
                ChapterNumber = 23,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-24",
                Author = adminAuthor,
                Title = "Chapter 24 Discussion",
                Body = "Chapter Title: A Love That Stays\n\nChapter Summary: Hazel reads Augustus’ final letter — a breathtaking, soul-stirring goodbye that reframes grief, love, and what it means to leave a mark on someone’s life.",
                BookId = "1",
                AfterChapter = 24,
                ChapterNumber = 24,
                LitClubId = null
            },
            new LitClubApi.Domain.Thread
            {
                Id = "thread-25",
                Author = adminAuthor,
                Title = "Chapter 25 Discussion",
                Body = "Chapter Title: Okay\n\nChapter Summary: Hazel reflects on Augustus’ final words and the impact of their love. Through grief, she finds peace — and a belief that joy is possible even after unimaginable loss.",
                BookId = "1",
                AfterChapter = 25,
                ChapterNumber = 25,
                LitClubId = null
            }
        };

        // --- LitClub-specific threads (Fans of John Green, LitClubId = "1") ---
        // One per chapter, same book + afterChapter, but scoped to the club.
        var litClubThreads = new List<LitClubApi.Domain.Thread>();
        for (int chapter = 1; chapter <= 25; chapter++)
        {
            litClubThreads.Add(new LitClubApi.Domain.Thread
            {
                Id = $"fans-john-green-thread-{chapter}",
                Author = adminAuthor,
                Title = $"Fans of John Green – Chapter {chapter} Thread",
                Body = $"Club-only discussion for Chapter {chapter} of The Fault in Our Stars.\n\nThis thread is visible under the My LitClub tab for members of 'Fans of John Green'.",
                BookId = "1",
                AfterChapter = chapter,
                ChapterNumber = chapter,
                LitClubId = "1"
            });
        }

        // Use a "now" reference for relative timestamps
        var now = DateTime.UtcNow;

        // 15 top-level comments (chapter 1 thread)
        List<Comment> comments =
        [
            new Comment { Id = "comment-1",  ThreadId = chapterThreads[0].Id, Author = authors[0], Body = "i thought this chapter was mid. i mean it just couldve been better. also cancer is kinda lame like u could have given them a better disease.", Score = 22, Created = now.AddHours(-2) },
            new Comment { Id = "comment-2",  ThreadId = chapterThreads[0].Id, Author = authors[1], Body = "hazel is literally the most relatable narrator ever. like the sarcasm?? elite.", Score = -3, Created = now.AddHours(-5) },
            new Comment { Id = "comment-3",  ThreadId = chapterThreads[0].Id, Author = authors[2], Body = "i forgot how funny this book is?? it’s about cancer but i laughed like 3 times in the first chapter help 💀", Score = 35, Created = now.AddHours(-9) },
            new Comment { Id = "comment-4",  ThreadId = chapterThreads[0].Id, Author = authors[3], Body = "the support group in the literal heart of jesus is so unserious SKDFJSDK", Score = 57, Created = now.AddHours(-13) },
            new Comment { Id = "comment-5",  ThreadId = chapterThreads[0].Id, Author = authors[4], Body = "Every time I re-read this chapter I’m reminded that John Green really said ‘I’m gonna be hilarious and then emotionally destroy you later’", Score = 49, Created = now.AddHours(-20) },
            new Comment { Id = "comment-6",  ThreadId = chapterThreads[0].Id, Author = authors[5], Body = "not me reading 6 pages and already questioning my existence😭", Score = 28, Created = now.AddDays(-1).AddHours(-3) },
            new Comment { Id = "comment-7",  ThreadId = chapterThreads[0].Id, Author = authors[6], Body = "hot take but hazel’s mom is so underrated. like she rlly be trying her best", Score = 31, Created = now.AddDays(-1).AddHours(-8) },
            new Comment { Id = "comment-8",  ThreadId = chapterThreads[0].Id, Author = authors[7], Body = "the way hazel describes cancer like it’s an annoying roommate instead of life-ruining is kinda iconic tbh", Score = 19, Created = now.AddDays(-2).AddHours(-2) },
            new Comment { Id = "comment-9",  ThreadId = chapterThreads[0].Id, Author = authors[8], Body = "ok but if I was forced to go to a support group in a church basement I would also be acting up", Score = 14, Created = now.AddDays(-2).AddHours(-6) },
            new Comment { Id = "comment-10", ThreadId = chapterThreads[0].Id, Author = authors[9], Body = "chapter 1 is like the calm before a tornado. it’s cute. it’s funny. it’s light. and then BAM. john green Pain™", Score = 63, Created = now.AddDays(-3) },
            new Comment { Id = "comment-11", ThreadId = chapterThreads[0].Id, Author = authors[4], Body = "I FUCKING HATE THIS BOOK.", Score = -112, Created = now.AddDays(-3).AddHours(-5) },
            new Comment { Id = "comment-12", ThreadId = chapterThreads[0].Id, Author = authors[3], Body = "This comment has many upvotes for the simple reason that it is good.", Score = 1234, Created = now.AddDays(-4) },

            // Negative scores
            new Comment { Id = "comment-13", ThreadId = chapterThreads[0].Id, Author = authors[3], Body = "i don’t get the hype. it’s literally just kids complaining for 20 pages.", Score = -3, Created = now.AddDays(-4).AddHours(-6) },
            new Comment { Id = "comment-14", ThreadId = chapterThreads[0].Id, Author = authors[1], Body = "unpopular opinion: hazel is lowkey kinda annoying in this chapter sry", Score = -49, Created = now.AddDays(-5) },
            new Comment { Id = "comment-15", ThreadId = chapterThreads[0].Id, Author = authors[5], Body = "this book is overrated. read a real classic instead.", Score = -6, Created = now.AddDays(-6) },
            new Comment { Id = "comment-16", ThreadId = chapterThreads[0].Id, Author = authors[7], Body = "john green fans always act like he invented emotions lol", Score = -32, Created = now.AddDays(-7) },   // ~1 week ago
            new Comment { Id = "comment-17", ThreadId = chapterThreads[0].Id, Author = authors[2], Body = "the jokes about cancer in this chapter are kinda insensitive ngl.", Score = -10, Created = now.AddDays(-7).AddHours(-3) } // ~1 week ago
        ];

        // 20+ replies referencing the top-level comments
        List<Comment> replies =
        [
            new Comment { Id = "reply-1",  ThreadId = chapterThreads[0].Id, Author = authors[1], Body = "facts. the humor makes the serious parts hit even harder later.",      ParentCommentId = "comment-5",  Score = 18,  Created = now.AddHours(-1) },
            new Comment { Id = "reply-2",  ThreadId = chapterThreads[0].Id, Author = authors[4], Body = "the ‘literal heart of jesus’ line is meme-worthy every time 😂",        ParentCommentId = "comment-4",  Score = 25,  Created = now.AddHours(-3) },
            new Comment { Id = "reply-3",  ThreadId = chapterThreads[0].Id, Author = authors[7], Body = "i kinda disagree—hazel’s voice feels earned because it’s defensive + honest.", ParentCommentId = "comment-12", Score = 9,   Created = now.AddHours(-6)  },
            new Comment { Id = "reply-4",  ThreadId = chapterThreads[0].Id, Author = authors[0], Body = "i don’t think it’s overrated, it’s just very specific about grief + humor.",   ParentCommentId = "comment-13", Score = 7,   Created = now.AddHours(-7)  },
            new Comment { Id = "reply-5",  ThreadId = chapterThreads[0].Id, Author = authors[6], Body = "yeah the mom scenes in later chapters really land. chapter 1 sets it up.",     ParentCommentId = "comment-7",  Score = -11, Created = now.AddDays(-1)  },
            new Comment { Id = "reply-6",  ThreadId = chapterThreads[0].Id, Author = authors[2], Body = "same, laughed and then remembered the topic and felt weird about it.",         ParentCommentId = "comment-3",  Score = -5,  Created = now.AddDays(-1).AddHours(-2) },
            new Comment { Id = "reply-7",  ThreadId = chapterThreads[0].Id, Author = authors[9], Body = "this! the basement vibe felt painfully accurate lol",                        ParentCommentId = "comment-9",  Score = 8,   Created = now.AddDays(-1).AddHours(-4) },
            new Comment { Id = "reply-8",  ThreadId = chapterThreads[0].Id, Author = authors[5], Body = "hot take accepted, but the ‘kids complaining’ read feels shallow tbh.",        ParentCommentId = "comment-11", Score = 6,   Created = now.AddDays(-2)  },
            new Comment { Id = "reply-9",  ThreadId = chapterThreads[0].Id, Author = authors[8], Body = "i think the ‘insensitive’ moments are intentional tension—dark humor coping.", ParentCommentId = "comment-15", Score = 10,  Created = now.AddDays(-2).AddHours(-3) },
            new Comment { Id = "reply-10", ThreadId = chapterThreads[0].Id, Author = authors[3], Body = "peak john green: disarm with jokes → destroy with feelings later.",           ParentCommentId = "comment-5",  Score = 21,  Created = now.AddDays(-2).AddHours(-6) },
            new Comment { Id = "reply-11", ThreadId = chapterThreads[0].Id, Author = authors[7], Body = "agreed, the pace is sneaky-fast. breezy now, layered after.",                 ParentCommentId = "comment-10", Score = -33, Created = now.AddDays(-3) },
            new Comment { Id = "reply-12", ThreadId = chapterThreads[0].Id, Author = authors[0], Body = "support group leader felt like a real person, not a caricature. nice touch.", ParentCommentId = "comment-4",  Score = 13,  Created = now.AddDays(-3).AddHours(-1) },
            new Comment { Id = "reply-13", ThreadId = chapterThreads[0].Id, Author = authors[2], Body = "counterpoint: the voice is sharp because hazel’s rationing energy.",           ParentCommentId = "comment-12", Score = 5,   Created = now.AddDays(-3).AddHours(-5) },
            new Comment { Id = "reply-14", ThreadId = chapterThreads[0].Id, Author = authors[6], Body = "i get where you’re coming from, but ‘real classic’ is a weird gate.",          ParentCommentId = "comment-13", Score = 4,   Created = now.AddDays(-4) },
            new Comment { Id = "reply-15", ThreadId = chapterThreads[0].Id, Author = authors[1], Body = "the chapter’s restraint is why later chapters crush me every reread.",         ParentCommentId = "comment-10", Score = -14, Created = now.AddDays(-4).AddHours(-2) },
            new Comment { Id = "reply-16", ThreadId = chapterThreads[0].Id, Author = authors[8], Body = "same—the humor is disarming but not dismissive, which is hard to pull off.",   ParentCommentId = "comment-3",  Score = 9,   Created = now.AddDays(-4).AddHours(-6) },
            new Comment { Id = "reply-17", ThreadId = chapterThreads[0].Id, Author = authors[4], Body = "john green fans == stupid dumb iditios == true.",                             ParentCommentId = "comment-4",  Score = -412,Created = now.AddDays(-5) },
            new Comment { Id = "reply-18", ThreadId = chapterThreads[0].Id, Author = authors[4], Body = "ngl the ‘heart of jesus’ line made me snort in public 😬",                     ParentCommentId = "comment-4",  Score = 15,  Created = now.AddDays(-5).AddHours(-3) },
            new Comment { Id = "reply-19", ThreadId = chapterThreads[0].Id, Author = authors[9], Body = "fair, but let people vibe with modern books too. both/and!",                   ParentCommentId = "comment-13", Score = -101,Created = now.AddDays(-6) },
            new Comment { Id = "reply-20", ThreadId = chapterThreads[0].Id, Author = authors[5], Body = "i read it as hazel being prickly because everything is exhausting.",            ParentCommentId = "comment-12", Score = 7,   Created = now.AddDays(-6).AddHours(-4) },
            new Comment { Id = "reply-21", ThreadId = chapterThreads[0].Id, Author = authors[0], Body = "agree—chapter 1 is the feint. later is the punch.",                           ParentCommentId = "comment-10", Score = 18,  Created = now.AddDays(-7) },   // ~1 week ago
            new Comment { Id = "reply-22", ThreadId = chapterThreads[0].Id, Author = authors[0], Body = "RIP john green's wife i bet she hates her life cuz it sounds like john is just like hazel lmao. hank is the better one.", ParentCommentId = "comment-15", Score = -101, Created = now.AddDays(-7).AddHours(-2) },
            new Comment { Id = "reply-23", ThreadId = chapterThreads[0].Id, Author = authors[0], Body = "i really dont fw the haters of this book cuz this shit is fire, also totally agree", ParentCommentId = "comment-5", Score = 114, Created = now.AddDays(-1).AddHours(-6) },
            new Comment { Id = "reply-24", ThreadId = chapterThreads[0].Id, Author = authors[2], Body = "This comment is so downvoted because its author is an idiot with bad opinions.", ParentCommentId = "comment-12", Score = -1234, Created = now.AddDays(-2).AddHours(-5) },
            new Comment { Id = "reply-25", ThreadId = chapterThreads[0].Id, Author = authors[3], Body = "augustus lowkey bad?", ParentCommentId = "comment-12", Score = 9993, Created = now.AddHours(-30) }
        ];

        chapterThreads[0].CommentCount = comments.Count + replies.Count;

        // ---------- Upserts ----------

        // 1) Upsert GLOBAL threads
        foreach (var t in chapterThreads)
        {
            // PK is /threadId, which mirrors Id
            await container.UpsertItemAsync(t, new PartitionKey(t.Id));
        }

        // 2) Upsert LitClub threads for "Fans of John Green" (LitClubId = "1")
        foreach (var t in litClubThreads)
        {
            await container.UpsertItemAsync(t, new PartitionKey(t.Id));
        }

        // 3) Compute reply counts for parent comments (so they display accurately)
        var replyCounts = replies
            .Where(r => !string.IsNullOrEmpty(r.ParentCommentId))
            .GroupBy(r => r.ParentCommentId!)
            .ToDictionary(g => g.Key, g => g.Count());

        foreach (var c in comments)
        {
            if (replyCounts.TryGetValue(c.Id, out var rc))
                c.ReplyCount = rc;
        }

        // 4) Upsert comments and replies (partition key = parent thread id)
        foreach (var c in comments)
        {
            await container.UpsertItemAsync(c, new PartitionKey(c.ThreadId));
        }

        foreach (var r in replies)
        {
            await container.UpsertItemAsync(r, new PartitionKey(r.ThreadId));
        }
    }
}

/* end SeedThreads.cs */