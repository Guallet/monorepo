import { useIsMobile } from "@/utils/useIsMobile";
import { CategoryDto } from "@guallet/api-client";
import { Input, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryPickerModal } from "./CategoryPickerModal";
import { CategoryIcon } from "@/components/Categories/CategoryIcon";

interface CategoryPickerProps
  extends React.ComponentProps<typeof Input.Wrapper> {
  selectedCategory: CategoryDto | null;
  onCategorySelected: (selectedCategory: CategoryDto) => void;
  placeholder?: string;
}

export function CategoryPicker({
  selectedCategory,
  onCategorySelected,
  placeholder,
  ...props
}: Readonly<CategoryPickerProps>) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [opened, { open, close }] = useDisclosure(false);

  const inputValue = useMemo(() => {
    if (!selectedCategory) {
      // We don't want to return anything, so it falls back to the placeholder
      return undefined;
    }

    return selectedCategory.name;
  }, [selectedCategory]);

  const inputPlaceholder =
    placeholder ||
    t("components.categoryPicker.input.placeholder", "Select category");

  return (
    <>
      <Input.Wrapper {...props}>
        <Input
          readOnly
          value={inputValue}
          onClick={open}
          placeholder={inputPlaceholder}
          pointer={true}
          leftSection={
            selectedCategory ? (
              <CategoryIcon categoryId={selectedCategory.id} />
            ) : null
          }
        />
      </Input.Wrapper>
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text>
            {t("components.categoryPicker.modal.title", "Select Category")}
          </Text>
        }
        size="lg"
        fullScreen={isMobile}
      >
        <CategoryPickerModal
          selectedCategory={selectedCategory}
          onSelectionChanged={onCategorySelected}
          close={close}
        />
      </Modal>
    </>
  );
}
