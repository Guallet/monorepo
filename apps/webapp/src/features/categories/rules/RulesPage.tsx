import { useLoaderData } from "react-router-dom";
import { CategoryRule } from "./RulesEngine";
import { Stack, Text } from "@mantine/core";

export async function loader() {
  return [] as unknown as RulesPageData;
}

interface RulesPageData {
  rules: CategoryRule[];
}

export function RulesPage() {
  const { rules } = useLoaderData() as RulesPageData;
  console.log("Page Data", { rules });

  return (
    <Stack>
      <Text>Rules</Text>
    </Stack>
  );
}
