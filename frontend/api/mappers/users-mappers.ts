// /frontend/api-mappers/users/users-mappers.ts

import { components } from '@/schema/openapi-types';
import type { User } from '@/domain/models';

type UserResponse = components['schemas']['UserResponse'];
type EditUserBody = components['schemas']['EditUserBody'];

export type EditUserInput = {
  userId: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  password?: string;
  bio?: string;
  profilePhotoUrl?: string;
  preferredGenres?: string[];
  privateAccount?: boolean;
  publicInteractionRestricted?: boolean;
  pronouns?: string[];
};

export function toEditUserBody(input: EditUserInput): EditUserBody {
  return {
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    userName: input.userName ?? null,
    email: input.email ?? null,
    password: input.password ?? null,
    bio: input.bio ?? null,
    profilePhotoUrl: input.profilePhotoUrl ?? null,
    preferredGenres: input.preferredGenres ?? null,
    privateAccount: input.privateAccount ?? null,
    pronouns: input.pronouns ?? null,
    publicInteractionRestricted: input.publicInteractionRestricted ?? null,
  };
}

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};

export function toDomainUser(dto: UserResponse): User {
  const firstName = dto.firstName ?? "";
  const lastName = dto.lastName ?? "";
  const userName = dto.userName ?? "";

  return {
    id: dto.id ?? "",

    // Domain requires these, so we must synthesize safe values
    name: `${firstName} ${lastName}`.trim() || userName || "Unknown User",
    username: userName || "",   // domain requires this separate field

    firstName,
    lastName,
    userName,
    email: dto.email ?? "",

    bio: dto.bio ?? "",
    pronouns: dto.pronouns ?? [],
    preferredGenres: dto.preferredGenres ?? [],

    // Nullable -> string
    profilePhotoUrl: dto.profilePhotoUrl ?? "",

    // Nullable -> boolean
    privateAccount: dto.privateAccount ?? false,
    publicInteractionRestricted: dto.publicInteractionRestricted ?? false,

    followingUserIds: dto.followingUserIds ?? [],
    followerUserIds: dto.followerUserIds ?? [],
    blockedUserIds: dto.blockedUserIds ?? [],
    litClubIds: dto.litClubIds ?? [],

    created: dto.created ?? "",

    // Domain requires password but backend never returns one, so default safely
    password: "",
  };
}