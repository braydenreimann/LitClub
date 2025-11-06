import { client } from "client";
import type { ThreadResponse } from "../domain/models/thread-types";

export async function getThread(threadId: string): Promise<ThreadResponse> {
    const { data, error } = await client.GET("/threads/{threadId}", {
        params: { path: { threadId } },
    });
    if (error || !data) throw new Error("Failed to load thread.");
    return data as ThreadResponse;
}