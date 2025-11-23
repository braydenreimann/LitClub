/* begin thread-types.ts */

export type Author = {
    authorId: string;
    username: string;
    profilePhotoUrl?: string | null;
};

export type ThreadResponse = {
    id: string;
    author: Author;
    title?: string | null;
    body: string;
    bookId?: string | null;
    chapterNumber?: number | null;
    litClubId?: string | null;
    created: string;
    updated?: string | null;
    commentCount: number;
    score: number;
    isDeleted: boolean;
};

export type CommentResponse = {
    id: string;
    threadId: string;
    author: Author;
    body: string;
    parentCommentId?: string | null;
    created: string;
    updated?: string | null;
    score: number;
    isDeleted: boolean;
    replyCount: number;
    userVote?: VoteDirection | null;
};

export type CommentListResponse = {
    items: CommentResponse[];
    continuationToken?: string | null;
};

export type VoteDirection = -1 | 0 | 1;

/* end thread-types.ts */