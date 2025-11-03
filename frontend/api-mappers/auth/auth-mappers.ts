import { components } from "schema/openapi-types"

type LoginRequest = components["schemas"]["LoginRequest"];

export type LoginInput = {
    email: string,
    password: string
}

export function toLoginRequest(input: LoginInput) {
    const loginRequest: LoginRequest = {
        userName: null,
        email: input.email,
        password: input.password,
    }

    return loginRequest;
}

type CreateAccountRequest = components["schemas"]["CreateAccountRequest"];

export type CreateAccountInput = {
    firstName: string,
    lastName: string,
    userName: string,
    email: string,
    password: string,
    bio?: string,
    profilePhotoUrl?: string | null,
    preferredGenres?: string[] | null,
    privateAccount: boolean;
    publicInteractionRestricted: boolean;
}

export function toCreateAccountRequest(input: CreateAccountInput) {
    const createAccountRequest: CreateAccountRequest = {
        firstName: input.firstName,
        lastName: input.lastName,
        userName: input.userName,
        email: input.email,
        password: input.password,
        bio: input.bio,
        profilePhotoUrl: input.profilePhotoUrl,
        preferredGenres: input.preferredGenres,
        privateAccount: input.privateAccount,
        publicInteractionRestricted: input.publicInteractionRestricted
    }

    return createAccountRequest;
}