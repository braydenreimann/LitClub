import { components } from "@/schema/openapi-types";

type EditUserBody = components["schemas"]["EditUserBody"];

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
    /*pronouns: input.pronouns ?? null,*/
    publicInteractionRestricted: input.publicInteractionRestricted ?? null,
  };
}

export type PasswordChangeInput = {
  currentPassword: string;
  newPassword: string;
};
