export type Category = {
  id: string;
  name: string;
  icon: string;
  colour: string;
  parentId: string | null;
};

export type AppCategory = {
  id: string;
  name: string;
  icon: string;
  colour: string;
  subCategories: AppCategory[];
};
