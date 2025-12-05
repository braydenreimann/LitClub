import { Router } from 'expo-router';

type BookHref = {
  pathname: '/books/[bookId]';
  params: {
    bookId: string;
    litClubId?: string | null;
    litClubName?: string | null;
    litClubOwnerId?: string | null;
  };
};

export const bookDetailHref = (
  bookId: string,
  litClubId?: string | null,
  litClubName?: string | null,
  litClubOwnerId?: string | null
): BookHref => ({
  pathname: '/books/[bookId]',
  params: {
    bookId,
    ...(litClubId ? { litClubId } : {}),
    ...(litClubName ? { litClubName } : {}),
    ...(litClubOwnerId ? { litClubOwnerId } : {}),
  },
});

export const pushBookDetail = (
  router: Router,
  bookId: string,
  litClubId?: string | null,
  litClubName?: string | null,
  litClubOwnerId?: string | null
) => {
  router.push(bookDetailHref(bookId, litClubId, litClubName, litClubOwnerId));
};

type UserHref = {
    pathname: '/users/[userId]';
    params: {
        userId: string;
    };
};

export const userDetailHref = (
    userId: string,
): UserHref => ({
    pathname: '/users/[userId]',
    params: {
        userId
    },
});

export const pushUserDetail = (
    router: Router,
    userId: string,
) => {
    router.push(userDetailHref(userId));
};