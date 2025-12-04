// /frontend/api-mappers/litclubs/litclubs-mappers.ts

import type { components } from '@/api/schema/openapi-types';
import type { LitClub } from '@/domain/models';

type AddLitClubRequest = components['schemas']['AddLitClubRequest'];
type LitClubResponse = components['schemas']['LitClubResponse'];

// Frontend-defined input for creating a LitClub
export type AddLitClubInput = {
    name: string;
    ownerUserId: string;
    ownerUserName: string;
    description: string;
    preferredGenres: string[] | null;
    privateClub: boolean;
    memberUserIds: string[] | null;
};

// Map frontend AddLitClubInput -> backend AddLitClubRequest (OpenAPI)
export function toAddLitClubRequest(input: AddLitClubInput): AddLitClubRequest {
    return {
        name: input.name,
        ownerUserId: input.ownerUserId,
        ownerUserName: input.ownerUserName,
        description: input.description,
        preferredGenres: input.preferredGenres,
        privateClub: input.privateClub,
        memberUserIds: input.memberUserIds,
        // libraryId is not set here; backend will handle it if applicable
    };
}

// Map backend LitClubResponse (DTO) -> domain LitClub
export function toDomainLitClub(dto: LitClubResponse): LitClub {
    return {
        id: dto.id!,
        name: dto.name!,
        ownerUserId: dto.ownerUserId!,
        ownerUserName: dto.ownerUserName!,
        description: dto.description ?? '',
        preferredGenres: dto.preferredGenres ?? [],
        privateClub: dto.privateClub ?? false,
        memberUserIds: dto.memberUserIds ?? [],
        // NOTE: we are intentionally *not* including libraryId in the domain LitClub
    };
}