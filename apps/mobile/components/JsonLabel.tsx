import { Label } from "@guallet/ui-react-native";

interface JsonViewProps<T> {
  data: T;
}

// Used for Debugging
export function JsonView<T>({ data }: JsonViewProps<T>) {
  return <Label>{JSON.stringify(data, null, 2)}</Label>;
}
