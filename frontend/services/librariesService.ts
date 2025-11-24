import { LibraryBook, ShelfStatus } from '../domain/models'
import { client } from 'client';
import { toDomainLibraryBook } from '@/api-mappers/libraries/libraries-mappers';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
export async function editLibraryBookStatus(id: string, libraryBookIdInput: string, status: ShelfStatus): Promise<LibraryBook | null> {
    //Format body as payload for edit request. userId and libraryBookId always required
    const body = {
        status: status
    };

    //debugging
    console.log('=== EDIT LIBRARY BOOK STATUS ===');
    console.log('URL:', `${API_BASE_URL}/libraries/${id}/libraryBooks/${libraryBookIdInput}`);
    console.log('Status being sent:', status);
    console.log('Body being sent:', JSON.stringify(body));

    try {
        const response = await fetch(`${API_BASE_URL}/libraries/${id}/libraryBooks/${libraryBookIdInput}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify(body),
        }
        );

        //debugging
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error: ', response.status, errorText);
            throw new Error(`Server retured ${response.status}`);
        }

        const data = await response.json()
        console.log('Successfully updated, recieved:', data);
        return data ? toDomainLibraryBook(data) : null; 
    } catch (err) {
        console.error("Error in Library Status update")
        return null;
    }
}