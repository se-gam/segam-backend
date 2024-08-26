export type GodokBook = {
  id: number;
  title: string;
  bookCategoryId: number;
  bookCategory: {
    name: string;
  };
};
