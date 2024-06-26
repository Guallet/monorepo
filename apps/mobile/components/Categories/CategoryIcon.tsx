import { Icon } from "@guallet/ui-react-native";

function getCategoryIconName(name: string) {
  // Maps the current string to a FontAwesome icon name
  switch (name.toLowerCase()) {
    case "money":
      return "money-bill-wave";
    case "fxx":
      return "car";
    case "transfer":
      return "right-left";
    case "salary":
      return "sack-dollar";

    default:
      return "question";
  }
}

interface CategoryIconProps extends React.ComponentProps<typeof Icon> {
  name: string;
  color: string;
  isFontAwesomeName?: boolean;
}

export function CategoryIcon({
  name,
  color,
  isFontAwesomeName = false,
  ...props
}: CategoryIconProps) {
  return (
    <Icon
      name={isFontAwesomeName ? name : getCategoryIconName(name)}
      color={color}
      {...props}
    />
  );
}
