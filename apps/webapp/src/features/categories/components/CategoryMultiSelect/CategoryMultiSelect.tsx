import { CategoryDto } from "@guallet/api-client";
import { Input, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryMultiSelectModal } from "./CategoryMultiSelectModal";
import { useCategories } from "@guallet/api-react";

interface CategoryMultiSelectProps
  extends React.ComponentProps<typeof Input.Wrapper> {
  selectedCategories: CategoryDto[];
  onSelectionChanged: (selectedCategories: CategoryDto[]) => void;
}

export function CategoryMultiSelect({
  selectedCategories,
  onSelectionChanged,
  ...props
}: Readonly<CategoryMultiSelectProps>) {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [opened, { open, close }] = useDisclosure(false);
  const { categories } = useCategories();

  const inputValue = useMemo(() => {
    if (selectedCategories.length === 0) {
      // We don't want to return anything, so it falls back to the placeholder
      return "";
    }

    if (selectedCategories.length === categories.length) {
      return t(
        "components.categoryMultiSelect.input.valueAll",
        "All categories selected"
      );
    } else {
      const label = t("components.categoryMultiSelect.input.value", {
        count: selectedCategories.length,
      });
      return label;
    }
  }, [selectedCategories, t]);

  return (
    <>
      <Input.Wrapper {...props}>
        <Input
          readOnly
          value={inputValue}
          onClick={open}
          placeholder={t(
            "components.categoryMultiSelect.input.placeholder",
            "Select categories"
          )}
          pointer={true}
        />
      </Input.Wrapper>
      <Modal
        opened={opened}
        onClose={close}
        title={
          <Text>
            {t(
              "components.categoryMultiSelect.modal.title",
              "Select Categories"
            )}
          </Text>
        }
        size="lg"
        fullScreen={isMobile}
      >
        <CategoryMultiSelectModal
          selectedCategories={selectedCategories}
          onSelectionChanged={onSelectionChanged}
          close={close}
        />
      </Modal>
    </>
  );
}
