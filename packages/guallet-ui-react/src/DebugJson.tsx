import { Code } from "@mantine/core";

export function DebugJson({ data }: Readonly<{ data: any }>) {
  return <Code block>{JSON.stringify(data, null, 2)}</Code>;
}
