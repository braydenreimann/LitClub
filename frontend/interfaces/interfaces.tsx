// All one to one objects from backend are stored in these interfaces

export interface User {
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

export interface Edition {
    id: string;
    format: number;
    publisher: string;
    publicationDate: string;
    printLength: number;
    isbn13s: string[];
}

export interface Book {
    id: string;
    title: string;
    author: string;
    totalChapters: number;
    genre: string;
    description: string;
    editions: Edition[];
}

export interface LibraryBook {
    id: string;
    status: number;
    startedReading: string;
    finishedReading: string;
    currentPage: number;
    percentComplete: number;
    onPedastal: boolean;
}

export interface DisplayBook {
    id: string;
    title: string;
}