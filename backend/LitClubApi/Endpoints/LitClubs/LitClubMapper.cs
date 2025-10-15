using LitClubApi.Domain;
using LitClubApi.Endpoints.LitClubs.AddLitClub;
using LitClubApi.Endpoints.LitClubs.EditLitClub;

namespace LitClubApi.Endpoints.LitClubs;

public static class LitClubMapper
{
    public static LitClub ToDomain(AddLitClubRequest request)
    {
        var members = request.MemberUserIds?.ToList() ?? new List<string>();

        if (!members.Contains(request.OwnerUserId, StringComparer.Ordinal))
        {
            members.Add(request.OwnerUserId);
        }

        return new LitClub
        {
            Name = request.Name,
            OwnerUserId = request.OwnerUserId,
            Description = request.Description,
            PreferredGenres = request.PreferredGenres?.ToList() ?? new List<string>(),
            PrivateClub = request.PrivateClub,
            MemberUserIds = members,
            LibraryId = request.LibraryId
        };
    }

    public static void ApplyUpdates(LitClub litClub, EditLitClubBody body)
    {
        if (body.Name is not null)
        {
            litClub.Name = body.Name;
        }

        if (body.OwnerUserId is not null)
        {
            litClub.OwnerUserId = body.OwnerUserId;
            EnsureOwnerMembership(litClub);
        }

        if (body.Description is not null)
        {
            litClub.Description = body.Description;
        }

        if (body.PreferredGenres is not null)
        {
            litClub.PreferredGenres = body.PreferredGenres.ToList();
        }

        if (body.PrivateClub is not null)
        {
            litClub.PrivateClub = body.PrivateClub.Value;
        }

        if (body.MemberUserIds is not null)
        {
            litClub.MemberUserIds = body.MemberUserIds.ToList();
            EnsureOwnerMembership(litClub);
        }

        if (body.LibraryId is not null)
        {
            litClub.LibraryId = body.LibraryId;
        }
    }

    public static LitClubResponse ToResponse(this LitClub litClub) => new()
    {
        Id = litClub.Id,
        Name = litClub.Name,
        OwnerUserId = litClub.OwnerUserId,
        Description = litClub.Description,
        PreferredGenres = litClub.PreferredGenres.ToArray(),
        PrivateClub = litClub.PrivateClub,
        MemberUserIds = litClub.MemberUserIds.ToArray(),
        LibraryId = litClub.LibraryId,
        Created = litClub.Created
    };

    private static void EnsureOwnerMembership(LitClub litClub)
    {
        if (!litClub.MemberUserIds.Contains(litClub.OwnerUserId, StringComparer.Ordinal))
        {
            litClub.MemberUserIds.Add(litClub.OwnerUserId);
        }
    }
}
