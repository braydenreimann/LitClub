/* begin models.ts */

/*
    Note: Domain models exist to represent the core business concepts of your
    application, cleanly and indpendent from the backend shapes.
*/

export type User = {
    name: string;
    username: string;
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    bio: string;
    pronouns: string[];
    profilePhotoUrl: string;
    preferredGenres: string[];
    privateAccount: boolean;
    publicInteractionRestricted: boolean;
    followingUserIds: string[];
    followerUserIds: string[];
    blockedUserIds: string[];
    litClubIds: string[];
    created: string;
    password: string;
}

export type Edition = {
    id: string;
    format: number;
    publisher: string;
    publicationDate: string;
    printLength: number;
    isbn13s: string[];
}

export type Book = {
    id: string;
    title: string;
    author: string;
    totalChapters: number;
    genre: string;
    description: string;
    coverImageUrl: string;
    editions: Edition[];
    chapterThreadIds: string[];
}

export type LibraryBook = {
    id: string;
    bookId: string;
    status: number;
    startedReading: string;
    finishedReading: string;
    currentPage: number;
    percentComplete: number;
    onPedastal: boolean;
    completedChapters: boolean[];
}

export type DisplayBook = {
    id: string;
    title: string;
    coverImageUrl: string;
}

export type LitClub = {
    id: string,
    name: string,
    ownerUserId: string,
    ownerUserName: string,
    description: string,
    preferredGenres: string[],
    privateClub: boolean,
    memberUserIds: string[]
}
