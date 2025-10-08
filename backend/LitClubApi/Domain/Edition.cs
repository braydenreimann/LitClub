using System;

namespace LitClubApi.Domain;

public class Edition
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required BookFormat Format { get; set; }
    public required string Publisher { get; set; }
    public required DateOnly PublicationDate { get; set; }
    public int? PrintLength { get; set; }
    public List<string> Isbn13s { get; set; } = [];
}