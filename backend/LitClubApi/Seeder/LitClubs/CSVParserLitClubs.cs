using LitClubApi.Endpoints.LitClubs.AddLitClub;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace LitClubApi.Endpoints.LitClubs.AddLitClub
{
    public class CSVParserLitClubs
    {
        public static List<AddLitClubRequest> Parse(string csvPath)
        {
            var clubs = new List<AddLitClubRequest>();

            if (!File.Exists(csvPath))
            {
                Console.WriteLine("Error: LitClubs CSV file does not exist at " + csvPath);
                return clubs;
            }

            var lines = File.ReadAllLines(csvPath);

            // Expecting header row followed by:
            // id,name,ownerUserId,ownerUserName,description,preferredGenres,privateClub,memberUserIds

            for (int i = 1; i < lines.Length; i++)
            {
                var line = lines[i];

                if (string.IsNullOrWhiteSpace(line))
                    continue;

                var col = line.Split(',').Select(x => x.Trim()).ToArray();

                if (col.Length != 8)
                {
                    Console.WriteLine($"Skipping line {i + 1}: invalid number of columns ({col.Length}/8)");
                    continue;
                }

                // Column layout:
                // [0] id  (ignored)
                // [1] name
                // [2] ownerUserId
                // [3] ownerUserName
                // [4] description
                // [5] preferredGenres (semicolon-separated)
                // [6] privateClub
                // [7] memberUserIds (semicolon-separated)

                var request = new AddLitClubRequest
                {
                    Name = col[1],
                    OwnerUserId = col[2],
                    OwnerUserName = col[3],
                    Description = col[4],
                    PreferredGenres = string.IsNullOrWhiteSpace(col[5])
                        ? new List<string>()
                        : col[5].Split(';', StringSplitOptions.RemoveEmptyEntries)
                                .Select(g => g.Trim())
                                .ToList(),
                    PrivateClub = bool.TryParse(col[6], out bool priv) ? priv : false,
                    MemberUserIds = string.IsNullOrWhiteSpace(col[7])
                        ? new List<string>()
                        : col[7].Split(';', StringSplitOptions.RemoveEmptyEntries)
                                .Select(u => u.Trim())
                                .ToList()
                };

                clubs.Add(request);
            }

            return clubs;
        }
    }
}
