// /frontend/services/litClubsService.ts

import { client } from 'client';
import type { LitClub } from '@/domain/models';
import {
    type AddLitClubInput,
    toAddLitClubRequest,
    toDomainLitClub,
} from '@/api-mappers/litclubs/litclubs-mappers';
import type { components } from '@/schema/openapi-types';

type ListLitClubsResponse = components['schemas']['ListLitClubsResponse'];

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