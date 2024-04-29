import { CategoryDto } from "@guallet/api-client";
import { Icon, Label, Spacing } from "@guallet/ui-react-native";
import { Touchable, TouchableOpacity, View } from "react-native";
import { CategoryIcon } from "./CategoryIcon";
import { AppCategory } from "@guallet/api-react";

interface CategoryRowProps extends React.ComponentProps<typeof View> {
  category: CategoryDto | AppCategory;
  onClick?: (category: CategoryDto | AppCategory) => void;
}

export function CategoryRow({ category, onClick, ...props }: CategoryRowProps) {
  return <BaseCategoryRow category={category} onClick={onClick} {...props} />;
}

export function ClickableCategoryRow({
  category,
  onClick,
  ...props
}: CategoryRowProps) {
  return (
    <TouchableOpacity onPress={() => onClick?.(category)}>
      <BaseCategoryRow category={category} onClick={onClick} {...props} />
    </TouchableOpacity>
  );
}

function BaseCategoryRow({ category, onClick, ...props }: CategoryRowProps) {
  return (
    <View
      style={[
        {
          padding: Spacing.medium,
          flexDirection: "row",
          gap: Spacing.small,
          alignContent: "center",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
        },
        props.style,
      ]}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <CategoryIcon name={category.icon} size={24} color={category.colour} />
      </View>
      <Label style={{ flexGrow: 1 }}>{category.name}</Label>
      {onClick && <Icon name="chevron-right" size={24} />}
    </View>
  );
}
