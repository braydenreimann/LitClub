using LitClubApi.Domain;

namespace LitClubApi.Endpoints.Users.AddUser;

public class CSVParserUsers
{
    public static List<LitClubUser> Parse(string csvPath)
    {
        if (!File.Exists(csvPath))
        {
            Console.WriteLine("Error: Users CSV file does not exist at " + csvPath);
            return new List<LitClubUser>();
        }

        string[] lines = File.ReadAllLines(csvPath);
        List<LitClubUser> users = new List<LitClubUser>();

        for (int i = 1; i < lines.Length; i++)
        {
            string line = lines[i];
            if (string.IsNullOrWhiteSpace(line)) continue;

            string[] col = line.Split(',');
            if (col.Length != 10)
            {
                Console.WriteLine($"Skipping line {i + 1}: invalid number of columns");
                continue;
            }

            for (int j = 0; j < col.Length; j++)
            {
                col[j] = col[j].Trim();
            }

            LitClubUser user = new LitClubUser
            {
                Id = col[0],
                FirstName = col[1],
                LastName = col[2],
                UserName = col[3],
                Email = col[4],
                PasswordHash = col[5],
                Bio = col[6],
                Pronouns = col[7].Split(';', StringSplitOptions.RemoveEmptyEntries).Select(p => p.Trim()).ToList(),
                PreferredGenres = col[8].Split(';', StringSplitOptions.RemoveEmptyEntries).Select(g => g.Trim()).ToList(),
                PrivateAccount = bool.TryParse(col[9], out bool privateAcc) ? privateAcc : false,
                PublicInteractionRestricted = false, // always false
                ProfilePhotoUrl = "default-profile.png", // default for now
                LitClubIds = new List<string>()
            };

            users.Add(user);
        }

        return users;
    }
}
