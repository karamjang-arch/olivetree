import books from "../data/books.json";
export const allBooks = () => books;
export const getBook = (slug) => books.find((b) => b.slug === slug) || null;
