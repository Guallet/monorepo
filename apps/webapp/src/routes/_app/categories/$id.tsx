import { AppSection } from "@/components/Cards/AppSection";
import { CategoryIcon } from "@/components/Categories/CategoryIcon";
import { AppScreen } from "@/components/Layout/AppScreen";
import { CategoryRow } from "@/features/categories/components/CategoryRow/CategoryRow";
import { useGroupedCategory } from "@guallet/api-react";
import {
  Stack,
  Button,
  Text,
  ColorInput,
} from "@mantine/core";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/categories/$id")({
  component: CategoryDetailsPage,
});

function CategoryDetailsPage() {
  const { id } = Route.useParams();
  const { category, isLoading } = useGroupedCategory(id);
  const navigation = useNavigate();

  const isParent = category?.parentId === null ?? false;

  return (
    <AppScreen isLoading={isLoading}>
      <Stack>
        <AppSection>
          <Stack align="center">
            <CategoryIcon categoryId={category?.id ?? null} />
            <Text>{category?.name}</Text>
            <ColorInput
              closeOnColorSwatchClick
              label="Colour"
              placeholder="Select the category colour"
              value={category?.colour}
              //   onChange={(value) => setColour(value)}
              //   error={colourError && "Invalid selected colour"}
              format="hex"
              swatches={[
                "#25262b",
                "#868e96",
                "#fa5252",
                "#e64980",
                "#be4bdb",
                "#7950f2",
                "#4c6ef5",
                "#228be6",
                "#15aabf",
                "#12b886",
                "#40c057",
                "#82c91e",
                "#fab005",
                "#fd7e14",
                "#fd7e14",
                "#fd7e14",
              ]}
            />
          </Stack>
        </AppSection>

        {isParent && (
          <Stack>
            <AppSection title="Sub-categories">
              {category?.subCategories.map((subCategory) => (
                <CategoryRow key={subCategory.id} category={subCategory} />
              ))}

              <Button
                variant="outline"
                onClick={() =>
                  navigation({
                    to: "/categories/new",
                    search: { parent: id },
                  })
                }
              >
                Add new sub category
              </Button>
            </AppSection>
          </Stack>
        )}
      </Stack>
    </AppScreen>
  );
}
