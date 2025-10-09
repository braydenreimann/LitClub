using LitClubApi.Domain;
using LitClubApi.Endpoints.Books.AddBook;

namespace TestProject //dotnet test
{
    [TestClass]
    public class ParserUnitTest
    {
        public TestContext TestContext { get; set; } = default!;
        [TestMethod]
        public void BookParseTest()
        {
            string nonexist = "000";
            List<Book> books = CSVParserInsert.Parse(nonexist);
            Assert.AreEqual(0, books.Count);
            Console.WriteLine("Non Exist Test Complete");

            string basePath = AppContext.BaseDirectory; //Makes relative path to function on all machines
            string litClubFolder = Path.GetFullPath(Path.Combine(basePath, "..", "..", "..", ".."));
            string exist = Path.Combine(litClubFolder, "LitClubApi", "bookdata", "bookdata.csv");

            books = CSVParserInsert.Parse(exist);
            Assert.AreNotEqual(0, books.Count);
            Assert.AreEqual("Her Knight at the Museum", books[0].Title);
            Assert.AreEqual("Bryn Donovan", books[0].Author);
            Assert.AreEqual(352, books[0].Editions[0].PrintLength);
            Assert.AreEqual(BookFormat.Hardcover, books[0].Editions[0].Format);
            Assert.AreEqual("978-0593816592", books[0].Editions[0].Isbn13s[0]);

            Console.WriteLine("Parse Test Complete");

        }
    }
}
