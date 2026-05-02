import { Code } from '@mantine/core';

export function DebugJson({ data }: Readonly<{ data: unknown }>) {
  return <Code block>{JSON.stringify(data, null, 2)}</Code>;
}
