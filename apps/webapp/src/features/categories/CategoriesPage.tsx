import { Category } from "./models/Category";
import { useLoaderData, useSearchParams } from "react-router-dom";
import { CategoriesList } from "./components/CategoriesList/CategoriesList";
import { loadCategories } from "./api/categories.api";
import { Stack, Text, Button, Modal } from "@mantine/core";
import { CategoriesDetailsModal } from "./CategoryDetailsModal";
import { useMediaQuery } from "@mantine/hooks";

const ADD_CATEGORY_QUERY = "create";
const ROOT_CATEGORY_ID = "root";

export async function loader() {
  return await loadCategories();
}

export function CategoriesPage() {
  const data = useLoaderData() as Category[];

  const isMobile = useMediaQuery("(max-width: 50em)");

  const [searchParams, setSearchParams] = useSearchParams();
  const isAddCategoryModalOpen = searchParams.has(ADD_CATEGORY_QUERY);
  const parentCategoryId = searchParams.get(ADD_CATEGORY_QUERY);

  function showModal(parentId: string) {
    setSearchParams((params) => {
      params.set(ADD_CATEGORY_QUERY, parentId);
      return params;
    });
  }

  function hideModal() {
    setSearchParams((params) => {
      params.delete(ADD_CATEGORY_QUERY);
      return params;
    });
  }

  if (data.length == 0) {
    return (
      <Stack>
        <Text>You don't have any category yet</Text>
        {/* <Button component="a" href={`/categories?${ADD_CATEGORY_QUERY}`}> */}
        <Button onClick={() => showModal(ROOT_CATEGORY_ID)}>
          Create your first category
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Modal
        centered
        opened={isAddCategoryModalOpen}
        overlayProps={{ opacity: 0.55, blur: 3 }}
        onClose={() => hideModal()}
        fullScreen={isMobile}
        title={
          parentCategoryId === ROOT_CATEGORY_ID
            ? "Add new category"
            : `Add subcategory for ${
                data.find((x) => x.id === parentCategoryId)?.name
              }`
        }
      >
        <CategoriesDetailsModal
          category={data.find((x) => x.id === parentCategoryId)?.name}
        />
      </Modal>
      <Stack>
        {/* <Button component="a" href={`/categories?${ADD_CATEGORY_QUERY}`}> */}
        <Button onClick={() => showModal(ROOT_CATEGORY_ID)}>
          Add new parent category
        </Button>
        <CategoriesList
          categories={data}
          onAddSubcategory={(parent) => {
            console.log("Add new subcategory for parent", parent);
            showModal(parent.id);
          }}
          onEdit={(x) => {
            console.log("On Edit category", x);
          }}
          onDelete={(x) => {
            console.log("On delete category", x);
          }}
        />
      </Stack>
    </>
  );
}
