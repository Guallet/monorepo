import { CategoryDto } from "@guallet/api-client";
import { Input, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useIsMobile } from "@/utils/useIsMobile";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CategoryMultiSelectModal } from "./CategoryMultiSelectModal";

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

  const inputValue = useMemo(() => {
    if (selectedCategories.length === 0) {
      // We don't want to return anything, so it falls back to the placeholder
      return undefined;
    }

    return t("components.categoryMultiSelect.input.value", {
      count: selectedCategories.length,
    });
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
