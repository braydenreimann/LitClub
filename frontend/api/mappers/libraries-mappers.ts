import { components } from "@/api/schema/openapi-types";
import type { LibraryBook } from "../../domain/models"

type LibraryBookResponse = components["schemas"]["LibraryBookResponse"];

export function toDomainLibraryBook(dto: LibraryBookResponse): LibraryBook {
    return {
        id: dto.id!,
        bookId: dto.bookId!, // required for fetching the full book later
        status: dto.status,
        startedReading: dto.startedReading!,
        finishedReading: dto.finishedReading!,
        currentPage: dto.currentPage!,
        percentComplete: dto.percentComplete!,
        onPedastal: dto.onPedastal!,
        completedChapters: dto.completedChapters ?? [],
    };
}
