import { LitClub } from "@/domain/models";
import { components } from "schema/openapi-types"

type AddLitClubRequest = components["schemas"]["AddLitClubRequest"]

export type AddLitClubInput = {
    name: string,
    ownerUserId: string,
    description: string,
    preferredGenres: string[] | null,
    privateClub: boolean,
    memberUserIds: string[] | null,
}

export function toAddLitClubRequest(input: AddLitClubInput) {
    const addLitClubRequest: AddLitClubRequest = {
        name: input.name,
        ownerUserId: input.ownerUserId,
        description: input.description,
        preferredGenres: input.preferredGenres,
        privateClub: input.privateClub,
        memberUserIds: input.memberUserIds
    }

    return addLitClubRequest;
}

type LitClubReponse = components["schemas"]["LitClubResponse"]

export function toDomainLitClub(dto: LitClubReponse): LitClub {
    return {
        id: dto.id!,
        name: dto.name!,
        ownerUserId: dto.ownerUserId!,
        description: dto.description!,
        preferredGenres: dto.preferredGenres!,
        privateClub: dto.privateClub!,
        memberUserIds: dto.memberUserIds!
    }
}