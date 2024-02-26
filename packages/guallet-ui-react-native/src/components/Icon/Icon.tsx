import { FontAwesome6 } from "@expo/vector-icons";

// NOTE: This component only uses FontAwesome5 for now

interface IconProps extends React.ComponentProps<typeof FontAwesome6> {
  name: React.ComponentProps<typeof FontAwesome6>["name"];
}

export function Icon({ name, ...props }: IconProps) {
  return <FontAwesome6 name={name} {...props} />;
}
