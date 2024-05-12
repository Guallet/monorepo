import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useMediaQuery } from "@mantine/hooks";
import {
  createCategory,
  updateCategory as serverUpdateCategory,
  deleteCategory as serverDeleteCategory,
} from "@/features/categories/api/categories.api";
import {
  CategoriesDetailsModal,
  CategoryFormData,
} from "@/features/categories/CategoryDetailsModal";
import { z } from "zod";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { CategoriesList } from "@/features/categories/components/CategoriesList/CategoriesList";
import { useCategories } from "@guallet/api-react";

const categoriesSearchSchema = z.object({
  modal: z.enum(["create", "edit"]).optional(),
  categoryId: z.string().optional(),
  parentId: z.string().optional(),
});

export const Route = createFileRoute("/_app/categories/old")({
  component: CategoriesPage,
  validateSearch: categoriesSearchSchema,
});

function CategoriesPage() {
  const { categories } = useCategories();

  const { modal, categoryId, parentId } = Route.useSearch();

  const isMobile = useMediaQuery("(max-width: 50em)");
  const isCategoryDetailsModalOpen = modal !== undefined;

  const navigate = useNavigate({ from: Route.fullPath });

  async function saveCategory(data: CategoryFormData) {
    console.log("Create new category", data);
    if (data.parentId === null && parentId) {
      data.parentId = parentId;
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

    navigate({
      search: () => ({
        modal: categoryId ? "edit" : "create",
        categoryId: categoryId ?? undefined,
        parentId: parentId ?? undefined,
      }),
    });
  }

  function hideModal(forceRefresh: boolean = false) {
    navigate({
      search: () => ({
        modal: undefined,
        categoryId: undefined,
        parentId: undefined,
      }),
    });

    if (forceRefresh) {
      Route.router?.invalidate();
    }
  }

  if (categories.length == 0) {
    return (
      <Stack>
        <Text>You don't have any category yet</Text>
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
          !parentId
            ? "Add new category"
            : `Add subcategory for ${
                categories.find((x) => x.id === parentId)?.name
              }`
        }
      >
        <CategoriesDetailsModal
          category={categories.find((x) => x.id === categoryId) ?? null}
          onCancel={hideModal}
          onSave={(x) => {
            if (parentId) {
              x.parentId = parentId;
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
          categories={categories}
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
