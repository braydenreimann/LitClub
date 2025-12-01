/* begin litclubsService.ts */

import { client } from 'client';
import { LitClub } from '../domain/models'
import { type AddLitClubInput, toAddLitClubRequest, toDomainLitClub } from '@/api-mappers/litclubs/litclubs-mappers';

export async function createLitClub(input: AddLitClubInput): Promise<LitClub | null> {
    try {
        // #1 Map the input to an AddLitClubRequest object
        const body = toAddLitClubRequest(input);

        // #2 Make API call with request body
        const { data, error } = await client.POST("/litclubs", { body });

        if (error) {
            // Parse status codes on error object
        }

        if (!data) {
            console.error('Unable to create LitClub.');
            return null;
        }

        // #3 Convert the response object to domain object
        return toDomainLitClub(data);

    } catch (err) {
        console.error('An unexpected error occurred:', err);
        throw err;
    }
}

/* end litclubsService.ts */