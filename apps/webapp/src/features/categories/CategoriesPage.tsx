import { Category } from "./models/Category";
import {
  useLoaderData,
  useRevalidator,
  useSearchParams,
} from "react-router-dom";
import { CategoriesList } from "./components/CategoriesList/CategoriesList";
import {
  loadCategories,
  createCategory,
  updateCategory as serverUpdateCategory,
  deleteCategory as serverDeleteCategory,
} from "./api/categories.api";
import { Stack, Text, Button, Modal } from "@mantine/core";
import {
  CategoriesDetailsModal,
  CategoryFormData,
} from "./CategoryDetailsModal";
import { useMediaQuery } from "@mantine/hooks";

const MODAL_SELECTED_CATEGORY_ID_QUERY = "id";
const MODAL_PARENT_CATEGORY_ID_QUERY = "parent";
const ROOT_CATEGORY_ID = "null";

export async function loader() {
  return await loadCategories();
}

export function CategoriesPage() {
  const data = useLoaderData() as Category[];
  const revalidator = useRevalidator();

  const isMobile = useMediaQuery("(max-width: 50em)");

  const [searchParams, setSearchParams] = useSearchParams();
  const isCategoryDetailsModalOpen =
    searchParams.has(MODAL_SELECTED_CATEGORY_ID_QUERY) ||
    searchParams.has(MODAL_PARENT_CATEGORY_ID_QUERY);
  const selectedCategoryId = searchParams.get(MODAL_SELECTED_CATEGORY_ID_QUERY);
  const selectedCategoryParentId = searchParams.get(
    MODAL_PARENT_CATEGORY_ID_QUERY
  );

  async function saveCategory(data: CategoryFormData) {
    console.log("Create new category", data);
    if (data.parentId === null && selectedCategoryParentId !== null) {
      data.parentId = selectedCategoryParentId;
    }
    await createCategory(data);
    hideModal(true);
  }

  async function updateCategory(id: string, data: CategoryFormData) {
    console.log("Update from cat form", id);
    try {
      await serverUpdateCategory(id, data);
    } catch (e) {
      console.error("Error Deleting the remote category", e);
    } finally {
      hideModal(true);
    }
  }

  async function deleteCategory(id: string) {
    console.log("OnDelete from cat form", id);
    try {
      await serverDeleteCategory(id);
    } catch (e) {
      console.error("Error Deleting the remote category", e);
    } finally {
      hideModal(true);
    }
  }

  function showModal(args: {
    categoryId: string | null;
    parentId: string | null;
  }) {
    const { categoryId, parentId } = args;
    setSearchParams((params) => {
      if (categoryId == null && parentId == null) {
        params.set(MODAL_PARENT_CATEGORY_ID_QUERY, ROOT_CATEGORY_ID);
      }

      if (categoryId) {
        params.set(MODAL_SELECTED_CATEGORY_ID_QUERY, categoryId);
      }
      if (parentId) {
        params.set(MODAL_PARENT_CATEGORY_ID_QUERY, parentId);
      }
      return params;
    });
  }

  function hideModal(forceRefresh: boolean = false) {
    setSearchParams((params) => {
      params.delete(MODAL_SELECTED_CATEGORY_ID_QUERY);
      params.delete(MODAL_PARENT_CATEGORY_ID_QUERY);
      return params;
    });

    if (forceRefresh) {
      revalidator.revalidate();
    }
  }

  if (data.length == 0) {
    return (
      <Stack>
        <Text>You don't have any category yet</Text>
        {/* <Button component="a" href={`/categories?${ADD_CATEGORY_QUERY}`}> */}
        <Button
          onClick={() =>
            showModal({
              categoryId: null,
              parentId: null,
            })
          }
        >
          Create your first category
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Modal
        centered
        opened={isCategoryDetailsModalOpen}
        overlayProps={{ opacity: 0.55, blur: 3 }}
        onClose={() => hideModal()}
        fullScreen={isMobile}
        title={
          selectedCategoryParentId === null
            ? "Add new category"
            : `Add subcategory for ${
                data.find((x) => x.id === selectedCategoryParentId)?.name
              }`
        }
      >
        <CategoriesDetailsModal
          category={data.find((x) => x.id === selectedCategoryId) ?? null}
          onCancel={hideModal}
          onSave={(x) => {
            if (selectedCategoryParentId !== null) {
              x.parentId = selectedCategoryParentId;
            }
            console.log("OnSubmit cat form", x);
            saveCategory(x);
          }}
          onUpdate={(category, formData) => {
            updateCategory(category.id, formData);
          }}
          onDelete={(x) => {
            deleteCategory(x.id);
          }}
        />
      </Modal>
      <Stack>
        <Button
          onClick={() =>
            showModal({
              categoryId: null,
              parentId: null,
            })
          }
        >
          Add new parent category
        </Button>
        <CategoriesList
          categories={data}
          onAddSubcategory={(parent) => {
            showModal({
              categoryId: null,
              parentId: parent.id,
            });
          }}
          onEdit={(x) => {
            showModal({
              categoryId: x.id,
              parentId: null,
            });
          }}
          onDelete={(x) => {
            deleteCategory(x.id);
          }}
        />
      </Stack>
    </>
  );
}
