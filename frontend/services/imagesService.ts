import { client } from 'client';

export async function getBookCoverUri(coverPath: string | undefined): Promise<string> {
    if (coverPath === undefined) {
        return "";
    }

    try {
        const { data } = await client.GET("/generate-sas/{blobName}", {
            params: { path: { blobName: coverPath } }
        });

        if (!data || data.sasUri == null) {
            // No book cover available
            return "";
        }

        return data.sasUri;

    } catch (err) {
        console.error('Error retrieving book cover:', err);
        throw err;
    }
}