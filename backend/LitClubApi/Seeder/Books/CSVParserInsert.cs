using Microsoft.VisualBasic.FileIO;
using LitClubApi.Domain;

public class CSVParserInsert
{
    public static List<Book> Parse(string csvpath)
    {
        if (!File.Exists(csvpath))
        {
            Console.WriteLine("Error: File does not exist... Are you using the correct path?");
            return [];
        }

        List<Book> booklist = [];

        using var parser = new TextFieldParser(csvpath);
        parser.TextFieldType = FieldType.Delimited;
        parser.SetDelimiters(",");
        parser.HasFieldsEnclosedInQuotes = true;
        parser.TrimWhiteSpace = true;

        // Skip header
        parser.ReadLine();

        while (!parser.EndOfData)
        {
            string[]? col = parser.ReadFields();
            if (col == null || col.Length == 0) continue;

            if (col.Length != 10)
            {
                Console.WriteLine(
                    $"Error: Invalid number of fields for {col[0]}. This book will not be inserted, continuing csv parse");
                continue;
            }

            string[] date = col[3].Split('/'); // MM/DD/YYYY

            int format;
            if (col[4].Equals("Physical")) format = 0;
            else if (col[4].Equals("Hardcover")) format = 0;
            else if (col[4].Equals("Paperback")) format = 1;
            else if (col[4].Equals("E-book")) format = 2;
            else if (col[4].Equals("Audiobook")) format = 3;
            else if (col[4].Equals("Mixed Media")) format = 4;
            else
            {
                Console.WriteLine($"Invalid Book Format for {col[0]}. This book will not be inserted, continuing csv parse");
                continue;
            }

            var edition = new Edition
            {
                Publisher = col[2],
                PublicationDate = new DateOnly(int.Parse(date[2]), int.Parse(date[0]), int.Parse(date[1])),
                Format = (BookFormat)format,
                PrintLength = int.Parse(col[5]),
                Isbn13s = new List<string> { col[6] }
            };

            var book = new Book
            {
                Title = col[0],
                Author = col[1],
                TotalChapters = int.Parse(col[7]),
                Genre = col[8],
                Editions = [edition],
                CoverImageUrl = col[9]
            };

            booklist.Add(book);
        }

        return booklist;
    }
}