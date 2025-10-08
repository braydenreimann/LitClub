using LitClubApi.Domain;
using System;
using System.IO;

namespace LitClubApi.Endpoints.Books.AddBook
{
    public class CSVParserInsert
    {
        public void parseinsert(string csvpath)
        {   
            try //Check for file existence
            {
                if (!File.Exists(csvpath))
                {
                    Console.WriteLine("Error: File does not exist... Are you using the correct path?");
                    return;
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error: {ex.Message}");
            }

            // Reads all lines from CSV
            // *NOT GOOD for massive csv, but will work fine with our smaller files
            string[] lines = File.ReadAllLines(csvpath);

            //start at i=1 to skip header
            for (int i = 1; i < lines.Length; i++) {
                string line = lines[i];
                string[] col = line.Split(',');

                // IF (ISBN already in Database){ continue;}. That logic will go here.


                //
                string[] date = col[3].Split('/');

                int format = 0;

                if (col[4].Equals("Physical")) { format = 0; } //current sample csv does not differentiate hardcover and paper back
                else if (col[4].Equals("Hardcover")) { format = 0; }
                else if (col[4].Equals("Paperback")) { format = 1; }
                else if (col[4].Equals("E-book")) { format = 2; }
                else if (col[4].Equals("Audiobook")) { format = 3; }
                else { Console.WriteLine("Invalid Book Format for " + col[0] + ". This book will not be inserted, continuting csv parse"); continue; }

                Edition edition = new Edition
                {
                    Publisher = col[2],
                    PublicationDate = new DateOnly(int.Parse(date[2]), int.Parse(date[0]), int.Parse(date[1])),
                    Format = (BookFormat)format,
                    PrintLength = int.Parse(col[5]),
                    Isbn13s = col[6]
                };

                Book book = new Book
                {
                    Title = col[0],
                    Author = col[1],
                    TotalChapters = int.Parse(col[7]),
                    Genre = col[8],
                    Edition = edition
                    // Description not currently represented in csv, subject to change
                };
             
                var id = book.Id;

                //add book to database logicS

            }

        }
    }
}
