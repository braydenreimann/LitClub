import { client } from 'client';

export async function getUri(Path: string | undefined): Promise<string> {
    if (Path === undefined) {
        return "";
    }

    try {
        const { data } = await client.GET("/generate-sas/{blobName}", {
            params: { path: { blobName: Path } }
        });

        if (!data || data.sasUri == null) {
            // No image available
            return "";
        }

        return data.sasUri;

    } catch (err) {
        console.error('Error retrieving image:', err);
        throw err;
    }
}