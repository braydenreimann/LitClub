// /frontend/services/litClubsService.ts

import { client } from '@/api/client';
import type { LitClub } from '@/domain/models';
import {
    type AddLitClubInput,
    toAddLitClubRequest,
    toDomainLitClub,
} from '@/api/mappers/litclubs-mappers';
import type { components } from '@/api/schema/openapi-types';

// Backend DTO for listing clubs
type ListLitClubsResponse = components['schemas']['ListLitClubsResponse'];

// Simple frontend inputs for join/leave
export type JoinLitClubInput = {
    litClubId: string;
    userId: string;
};

export type LeaveLitClubInput = {
    litClubId: string;
    userId: string;
};

// Create a new LitClub via POST /litclubs
export async function createLitClub(input: AddLitClubInput): Promise<LitClub | null> {
    try {
        const body = toAddLitClubRequest(input);

        const { data, error } = await client.POST('/litclubs', { body });

        if (error || !data) {
            console.error('Unable to create LitClub.', error);
            return null;
        }

        return toDomainLitClub(data);
    } catch (err) {
        console.error('An unexpected error occurred while creating LitClub:', err);
        throw err;
    }
}

// Fetch all LitClubs via GET /litclubs
export async function listLitClubs(): Promise<LitClub[]> {
    try {
        const { data, error } = await client.GET('/litclubs', {});

        if (error || !data) {
            console.warn('Failed to fetch LitClubs', error);
            return [];
        }

        const dto = data as ListLitClubsResponse;
        return (dto.litClubs ?? []).map(toDomainLitClub);
    } catch (err) {
        console.error('Error fetching LitClubs:', err);
        return [];
    }
}

// Join a LitClub via POST /litclubs/{litClubId}/members
export async function joinLitClub(input: JoinLitClubInput): Promise<LitClub | null> {
    const { litClubId, userId } = input;

    try {
        const { data, error } = await client.POST('/litclubs/{litClubId}/members', {
            params: { path: { litClubId } },
            body: { userId },
        });

        if (error || !data) {
            console.warn('Failed to join LitClub', error);
            return null;
        }

        return toDomainLitClub(data);
    } catch (err) {
        console.error('Error joining LitClub:', err);
        return null;
    }
}

// Leave a LitClub via DELETE /litclubs/{litClubId}/members
export async function leaveLitClub(input: LeaveLitClubInput): Promise<LitClub | null> {
    const { litClubId, userId } = input;

    try {
        const { data, error } = await client.DELETE('/litclubs/{litClubId}/members', {
            params: { path: { litClubId } },
            body: { userId },
        });

        if (error || !data) {
            console.warn('Failed to leave LitClub', error);
            return null;
        }

        return toDomainLitClub(data);
    } catch (err) {
        console.error('Error leaving LitClub:', err);
        return null;
    }
}