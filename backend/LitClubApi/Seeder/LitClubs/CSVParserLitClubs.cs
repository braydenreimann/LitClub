using LitClubApi.Domain;

namespace LitClubApi.Endpoints.LitClubs.AddLitClub;

public class CSVParserLitClubs
{
    public static List<LitClub> Parse(string csvPath)
    {
        if (!File.Exists(csvPath))
        {
            Console.WriteLine("Error: LitClubs CSV file does not exist at " + csvPath);
            return new List<LitClub>();
        }

        string[] lines = File.ReadAllLines(csvPath);
        List<LitClub> clubs = new List<LitClub>();

        for (int i = 1; i < lines.Length; i++)
        {
            string line = lines[i];
            if (string.IsNullOrWhiteSpace(line)) continue;

            string[] col = line.Split(',');
            if (col.Length != 8)
            {
                Console.WriteLine($"Skipping line {i + 1}: invalid number of columns");
                continue;
            }

            for (int j = 0; j < col.Length; j++)
            {
                col[j] = col[j].Trim();
            }

            LitClub club = new LitClub
            {
                Id = col[0],
                Name = col[1],
                OwnerUserId = col[2],
                OwnerUserName = col[3],
                Description = col[4],
                PreferredGenres = col[5].Split(';', StringSplitOptions.RemoveEmptyEntries).Select(g => g.Trim()).ToList(),
                PrivateClub = bool.TryParse(col[6], out bool priv) ? priv : false,
                MemberUserIds = col[7].Split(';', StringSplitOptions.RemoveEmptyEntries).Select(u => u.Trim()).ToList()
            };

            clubs.Add(club);
        }

        return clubs;
    }
}
