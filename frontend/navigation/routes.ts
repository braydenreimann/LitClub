import { Router } from 'expo-router';

type BookHref = {
  pathname: '/books/[bookId]';
  params: { bookId: string };
};

export const bookDetailHref = (bookId: string): BookHref => ({
  pathname: '/books/[bookId]',
  params: { bookId },
});

export const pushBookDetail = (router: Router, bookId: string) => {
  router.push(bookDetailHref(bookId));
};
