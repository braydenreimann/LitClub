/* begin frontend/services/litClubsService.ts */

import { client } from 'client';
import type { LitClub } from '../domain/models';
import {
    type AddLitClubInput,
    toAddLitClubRequest,
    toDomainLitClub,
} from '@/api-mappers/litclubs/litclubs-mappers';

/**
 * Create a new LitClub via POST /litclubs
 * - Maps frontend AddLitClubInput -> backend AddLitClubRequest
 * - Maps backend LitClubResponse -> frontend LitClub domain model
 */
export async function createLitClub(input: AddLitClubInput): Promise<LitClub | null> {
    try {
        const body = toAddLitClubRequest(input);

        const { data, error } = await client.POST('/litclubs', { body });

        if (error) {
            console.error('Error creating LitClub:', error);
            return null;
        }

        if (!data) {
            console.error('Unable to create LitClub. No data returned.');
            return null;
        }

        return toDomainLitClub(data);
    } catch (err) {
        console.error('An unexpected error occurred while creating LitClub:', err);
        throw err;
    }
}

/* end frontend/services/litClubsService.ts */