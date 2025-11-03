import { env } from "config/env";

export function getBookCoverUri(coverPath: string | undefined): string {
    if (coverPath === undefined) {
        return "";
    }
    return `http://${env.HOST_FROM_EXPO}:5112/covers/${coverPath}`;
}