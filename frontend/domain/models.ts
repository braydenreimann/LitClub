/*
    Note: Domain models exist to represent the core business concepts of your
    application in a clean,app-friendly shape—independent from the backend’s API shapes.
*/

export type User = {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    bio: string;
    profilePhotoUrl: string;
    preferredGenres: string[];
    privateAccount: boolean;
    publicInteractionRestricted: boolean;
    followingUserIds: string[];
    followerUserIds: string[];
    blockedUserIds: string[];
    litClubIds: string[];
    created: string;
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
    editions: Edition[];
}

export type LibraryBook = {
    id: string;
    status: number;
    startedReading: string;
    finishedReading: string;
    currentPage: number;
    percentComplete: number;
    onPedastal: boolean;
}

export type DisplayBook = {
    id: string;
    title: string;
}