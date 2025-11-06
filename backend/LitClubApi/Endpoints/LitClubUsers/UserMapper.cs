using LitClubApi.Domain;
using LitClubApi.Endpoints.LitClubUsers.EditUser;

namespace LitClubApi.Endpoints.LitClubUsers;

public static class UserMapper
{
    public static LitClubUser ToDomain(UserCreateRequestBase request) => new()
    {
        FirstName = request.FirstName,
        LastName = request.LastName,
        UserName = request.UserName,
        Email = request.Email,
        PasswordHash = request.Password,
        Bio = request.Bio,
        ProfilePhotoUrl = request.ProfilePhotoUrl,
        Pronouns = request.Pronouns?.ToList() ?? [],
        PreferredGenres = request.PreferredGenres?.ToList() ?? [],
        PrivateAccount = request.PrivateAccount,
        PublicInteractionRestricted = request.PublicInteractionRestricted
    };

    public static void ApplyUpdates(LitClubUser user, EditUserRequest request)
    {
        if (request.Body.FirstName is not null) user.FirstName = request.Body.FirstName;
        if (request.Body.LastName is not null) user.LastName = request.Body.LastName;
        if (request.Body.UserName is not null) user.UserName = request.Body.UserName;
        if (request.Body.Email is not null) user.Email = request.Body.Email;
        if (request.Body.Password is not null) user.PasswordHash = request.Body.Password;
        if (request.Body.Bio is not null) user.Bio = request.Body.Bio;
        if (request.Body.Pronouns is not null) user.Pronouns = request.Body.Pronouns;
        if (request.Body.ProfilePhotoUrl is not null) user.ProfilePhotoUrl = request.Body.ProfilePhotoUrl;
        if (request.Body.PreferredGenres is not null) user.PreferredGenres = request.Body.PreferredGenres.ToList();
        if (request.Body.PrivateAccount is not null) user.PrivateAccount = request.Body.PrivateAccount.Value;
        if (request.Body.PublicInteractionRestricted is not null) user.PublicInteractionRestricted = request.Body.PublicInteractionRestricted.Value;
        if (request.Body.FollowingUserIds is not null) user.FollowingUserIds = request.Body.FollowingUserIds.ToList();
        if (request.Body.FollowerUserIds is not null) user.FollowerUserIds = request.Body.FollowerUserIds.ToList();
        if (request.Body.BlockedUserIds is not null) user.BlockedUserIds = request.Body.BlockedUserIds.ToList();
        if (request.Body.LitClubIds is not null) user.LitClubIds = request.Body.LitClubIds.ToList();
    }

    public static UserResponse ToResponse(this LitClubUser user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        UserName = user.UserName,
        Email = user.Email,
        Bio = user.Bio,
        Pronouns = user.Pronouns,
        ProfilePhotoUrl = user.ProfilePhotoUrl,
        PreferredGenres = [.. user.PreferredGenres],
        PrivateAccount = user.PrivateAccount,
        PublicInteractionRestricted = user.PublicInteractionRestricted,
        FollowingUserIds = [.. user.FollowingUserIds],
        FollowerUserIds = [.. user.FollowerUserIds],
        BlockedUserIds = [.. user.BlockedUserIds],
        LitClubIds = [.. user.LitClubIds],
        Created = user.Created
    };
}
