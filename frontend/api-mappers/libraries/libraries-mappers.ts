import { components } from "@/schema/openapi-types";
import type { LibraryBook } from "../../domain/models"

type LibraryBookResponse = components["schemas"]["LibraryBookResponse"];

export function toDomainLibraryBook(dto: LibraryBookResponse): LibraryBook {
    return {
        id: dto.id!,
        status: dto.status,
        startedReading: dto.startedReading!,
        finishedReading: dto.finishedReading!,
        currentPage: dto.currentPage!,
        percentComplete: dto.percentComplete!,
        onPedastal: dto.onPedastal!
    }
}