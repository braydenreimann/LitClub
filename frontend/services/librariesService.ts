/* begin librariesService.ts */

import { LibraryBook } from '../domain/models'
import { client } from 'client';
import { toDomainLibraryBook } from '@/api-mappers/libraries/libraries-mappers';
import Constants from 'expo-constants';

const hostFromExpo = Constants.expoConfig?.hostUri?.split(':')[0];
// Fallback to your LAN IP if not available
const LAN_IP = hostFromExpo ?? '10.0.0.252';
const API_BASE_URL = `http://${LAN_IP}:5112`;


export async function getLibraryBook(ownerId: string, libraryBookId: string): Promise<LibraryBook | null> {
    try {
        const { data, error } = await client.GET("/libraries/{ownerId}/libraryBooks/{libraryBookId}", {
            params: { path: { ownerId, libraryBookId } },
        });

        if (error) {
            console.warn('Failed to fetch book literal', error.status);
            throw new Error(`HTTP error! Status: ${error.status}`);
        }

        if (!data) {
            console.error('No library data returned:', { ownerId, libraryBookId });
            return null;
        }

        return toDomainLibraryBook(data!);

    } catch (err) {
        console.error('Error fetching book:', err);
        throw err;
    }
}

//statuses 0:hasRead 1:currentlyReading 2: hiatus, 3:Want to Read
export async function editLibraryBookStatus(id: string, libraryBookIdInput: string, status: number): Promise<LibraryBook | null> {
    //Format body as payload for edit request. userId and libraryBookId always required
    const body = {
        OwnerId: id, libraryBookId: libraryBookIdInput,
        Body: { Status: status }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${id}/libraryBooks/${libraryBookIdInput}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",

                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            throw new Error(`Server retured ${response.status}`);
        }

        const data = await response.json()
        return data ? toDomainLibraryBook(data) : null;
    } catch (err) {
        console.error("Error in Library Status update")
        return null;
    }
}

/* end librariesService.ts */