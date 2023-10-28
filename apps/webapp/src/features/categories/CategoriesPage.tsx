import { Category } from "./models/Category";
import { useLoaderData } from "react-router-dom";
import { CategoriesList } from "./components/CategoriesList/CategoriesList";
import { loadCategories } from "./api/categories.api";
import { Stack, Text, Button } from "@mantine/core";

export async function loader() {
  return await loadCategories();
}

export function CategoriesPage() {
  const data = useLoaderData() as Category[];

  if (data.length == 0) {
    return (
      <Stack>
        <Text>You don't have any category yet</Text>
        <Button component="a" href="/categories/add">
          Create your first category
        </Button>
      </Stack>
    );
  }

  return (
    <Stack>
      <Button component="a" href="/categories/add">
        Add new parent category
      </Button>
      <CategoriesList
        categories={data}
        onAddSubcategory={(parent) => {
          console.log("Add new subcategory for parent", parent);
        }}
        onEdit={(x) => {
          console.log("On Edit category", x);
        }}
        onDelete={(x) => {
          console.log("On delete category", x);
        }}
      />
    </Stack>
  );
}
