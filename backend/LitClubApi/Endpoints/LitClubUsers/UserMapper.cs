using System.Linq;
using LitClubApi.Domain;
using LitClubApi.Endpoints.LitClubUsers.EditUser;
using LitClubApi.Utilities;

namespace LitClubApi.Endpoints.LitClubUsers;

public static class UserMapper
{
    public static LitClubUser ToDomain(UserCreateRequestBase request) => new()
    {
        FirstName = request.FirstName,
        LastName = request.LastName,
        UserName = request.UserName,
        Email = request.Email,
        PasswordHash = PasswordHasher.HashPassword(request.Password),
        Bio = request.Bio,
        ProfilePhotoUrl = request.ProfilePhotoUrl,
        PreferredGenres = request.PreferredGenres?.ToList() ?? [],
        PrivateAccount = request.PrivateAccount,
        PublicInteractionRestricted = request.PublicInteractionRestricted
    };

    public static void ApplyUpdates(LitClubUser user, EditUserRequest request)
    {
        if (request.FirstName is not null) user.FirstName = request.FirstName;
        if (request.LastName is not null) user.LastName = request.LastName;
        if (request.UserName is not null) user.UserName = request.UserName;
        if (request.Email is not null) user.Email = request.Email;
        if (request.Password is not null) user.PasswordHash = PasswordHasher.HashPassword(request.Password);
        if (request.Bio is not null) user.Bio = request.Bio;
        if (request.ProfilePhotoUrl is not null) user.ProfilePhotoUrl = request.ProfilePhotoUrl;
        if (request.PreferredGenres is not null) user.PreferredGenres = request.PreferredGenres.ToList();
        if (request.PrivateAccount is not null) user.PrivateAccount = request.PrivateAccount.Value;
        if (request.PublicInteractionRestricted is not null) user.PublicInteractionRestricted = request.PublicInteractionRestricted.Value;
        if (request.FollowingUserIds is not null) user.FollowingUserIds = request.FollowingUserIds.ToList();
        if (request.FollowerUserIds is not null) user.FollowerUserIds = request.FollowerUserIds.ToList();
        if (request.BlockedUserIds is not null) user.BlockedUserIds = request.BlockedUserIds.ToList();
        if (request.LitClubIds is not null) user.LitClubIds = request.LitClubIds.ToList();
    }

    public static UserResponse ToResponse(this LitClubUser user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        LastName = user.LastName,
        UserName = user.UserName,
        Email = user.Email,
        Bio = user.Bio,
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
