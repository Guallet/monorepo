import { Text } from "@mantine/core";

export function DebugJson({ data }: Readonly<{ data: any }>) {
  return <Text>{JSON.stringify(data, null, 2)}</Text>;
}
