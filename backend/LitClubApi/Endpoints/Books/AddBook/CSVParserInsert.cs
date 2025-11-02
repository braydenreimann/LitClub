using LitClubApi.Domain;
using System;
using System.IO;

namespace LitClubApi.Endpoints.Books.AddBook
{
    public class CSVParserInsert
    {
        public static List<Book> Parse(string csvpath) //Returns List of Books from CSV 
        {
            //Check for file existence

            if (!File.Exists(csvpath))
            {
                Console.WriteLine("Error: File does not exist... Are you using the correct path?");
                return [];
            }

            // Reads all lines from CSV
            // *NOT GOOD for massive csv, but will work fine with our smaller files
            string[] lines = File.ReadAllLines(csvpath);

            List<Book>? booklist = [];

            //start at i=1 to skip header
            for (int i = 1; i < lines.Length; i++)
            {
                string line = lines[i];
                if (string.IsNullOrWhiteSpace(line)) { continue; } //skip empty lines
                line = line.Replace("\t", "");
                line = line.TrimStart(); //Remove tabs if they exist

                string[] col = line.Split(',');

                if (col.Length != 10) //Check for correct number of columns
                {
                    Console.WriteLine("Error: Invalid number of fields for " + col[0] + ". This book will not be inserted, continuting csv parse");
                    continue;
                }

                for (int j = 0; j < col.Length; j++)
                {
                    col[j] = col[j].TrimStart(); //Fixes accidental spacing issues
                    col[j] = col[j].TrimEnd();
                }

                string[] date = col[3].Split('/'); //MM/DD/YYYY

                int format;

                if (col[4].Equals("Physical")) { format = 0; } //current sample csv does not differentiate hardcover and paper back
                else if (col[4].Equals("Hardcover")) { format = 0; }
                else if (col[4].Equals("Paperback")) { format = 1; }
                else if (col[4].Equals("E-book")) { format = 2; }
                else if (col[4].Equals("Audiobook")) { format = 3; }
                else if (col[4].Equals("Mixed Media")) { format = 4; }
                else { Console.WriteLine("Invalid Book Format for " + col[0] + ". This book will not be inserted, continuting csv parse"); continue; }

                Edition edition = new Edition
                {
                    Publisher = col[2],
                    PublicationDate = new DateOnly(int.Parse(date[2]), int.Parse(date[0]), int.Parse(date[1])),
                    Format = (BookFormat)format,
                    PrintLength = int.Parse(col[5]),
                    Isbn13s = new List<string> { col[6] }
                };

                Book book = new Book
                {
                    Title = col[0],
                    Author = col[1],
                    TotalChapters = int.Parse(col[7]),
                    Genre = col[8],
                    Editions = [edition],
                    CoverImagePath = col[9]
                };

                booklist.Add(book);

            }
            return booklist;
        }
    }
}
