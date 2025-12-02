// /frontend/services/usersService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../domain/models';
import { client } from 'client';
import {
    toEditUserBody,
    type EditUserInput,
    toDomainUser,
} from '@/api-mappers/users/users-mappers';

// Pull the current user from session storage (not an API call)
export async function getUser(): Promise<User | null> {
    try {
        const sessionString = await AsyncStorage.getItem('session');
        if (!sessionString) return null;

        const user: User = JSON.parse(sessionString);
        return user;
    } catch (error) {
        console.error('Error retrieving user from session:', error);
        return null;
    }
}

export async function getUserFromId(userId: string): Promise<User | null> {
    try {
        const { data, error } = await client.GET('/users/{userId}', {
            params: { path: { userId } },
        });

        if (error || !data) {
            console.warn('Failed to fetch user', error);
            throw new Error('Error fetching user');
        }

        return toDomainUser(data);
    } catch (error) {
        console.error('Error fetching user from id:', error);
        throw error;
    }
}

export async function editUser(input: EditUserInput): Promise<{
    success: boolean;
    data?: User;
    error?: unknown;
}> {
    try {
        const body = toEditUserBody(input);

        const { data, error } = await client.PATCH('/users/{userId}', {
            params: { path: { userId: input.userId } },
            body,
        });

        if (error || !data) {
            console.error('Error editing user:', error);
            return { success: false, error };
        }

        // Map DTO -> domain user
        const user = toDomainUser(data);

        return { success: true, data: user };
    } catch (err) {
        console.error('Unexpected error editing user:', err);
        return { success: false, error: err };
    }
}