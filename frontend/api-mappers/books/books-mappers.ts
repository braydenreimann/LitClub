import { components } from "@/schema/openapi-types";
import type { Book, Edition } from "../../domain/models"

type BookResponse = components["schemas"]["BookResponse"];
type EditionResponse = components["schemas"]["EditionResponse"];

export function toDomainEdition(dto: EditionResponse): Edition {
    return {
        id: dto.id!,
        format: dto.format,
        publisher: dto.publisher!,
        publicationDate: dto.publicationDate,
        printLength: dto.printLength!,
        isbn13s: dto.isbn13s!
    }
}

export function toDomainBook(dto: BookResponse): Book {
    return {
        id: dto.id!,
        title: dto.title!,
        author: dto.author!,
        totalChapters: dto.totalChapters,
        genre: dto.genre!,
        description: dto.description ?? "",
        editions: (dto.editions ?? []).map(toDomainEdition),
        coverImagePath: dto.coverImagePath!
    }
}