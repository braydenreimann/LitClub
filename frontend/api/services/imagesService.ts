/* begin imagesService.ts */

import { env } from 'config/env';

const API_BASE_URL = env.API_BASE_URL;

export async function getUriRead(Path: string | undefined): Promise<string> {
    if (Path === undefined) {
        return "";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate-sas-read/${Path}`)

        if (!response.ok) {
            console.warn('Failed to fetch Uri for read', response.status)
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json();

        return data.sasUri;

    } catch (err) {
        console.error('Error retrieving image:', err);
        throw err;
    }
}

export async function getUriWrite(Path: string | undefined): Promise<string> {
    if (Path === undefined) {
        return "";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/generate-sas-write/${Path}`)

        if (!response.ok) {
            console.warn('Failed to fetch Uri for write', response.status)
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json();

        return data.sasUri;

    } catch (err) {
        console.error('Error retrieving image:', err);
        throw err;
    }
}

/* end imagesService.ts */
