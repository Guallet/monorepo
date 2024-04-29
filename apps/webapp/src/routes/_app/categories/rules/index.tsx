import {
  Accordion,
  ActionIcon,
  Button,
  Center,
  Group,
  List,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { loadCategories } from "@/features/categories/api/categories.api";
import { RuleDto, loadRules } from "@/features/categories/rules/api/rules.api";

export const Route = createFileRoute("/_app/categories/rules/")({
  component: RulesPage,
  loader: loader,
});

async function loader() {
  const rules = await loadRules();
  const categories = await loadCategories();

  return { rules, categories };
}

function RulesPage() {
  const { rules } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <Stack>
      <Text>Rules</Text>
      <Button
        onClick={() => {
          navigate({ to: "/categories/rules/create" });
        }}
      >
        Create new rule
      </Button>

      <Accordion chevronPosition="right" variant="contained">
        {rules.map((rule) => (
          <RuleRow rule={rule} />
        ))}
      </Accordion>
    </Stack>
  );
}

interface RuleRowProps {
  rule: RuleDto;
}
export function RuleRow({ rule }: RuleRowProps) {
  return (
    <Accordion.Item value={rule.name} key={rule.id}>
      <Center>
        <Accordion.Control>
          <AccordionLabel rule={rule} />
        </Accordion.Control>
        <Group
          justify="flex-end"
          style={{
            minWidth: "fit-content",
            marginRight: "20px",
          }}
        >
          <Tooltip label="Edit">
            <ActionIcon variant="light">
              <IconEdit />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete">
            <ActionIcon variant="light" color="red">
              <IconTrash />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Center>

      <Accordion.Panel>
        <Text>Conditions</Text>
        <List>
          {rule.conditions.map((condition) => {
            return (
              <List.Item>
                {condition.field} {condition.operator} {condition.value}
              </List.Item>
            );
          })}
        </List>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

interface AccordionLabelProps {
  rule: RuleDto;
}

function AccordionLabel({ rule }: AccordionLabelProps) {
  return (
    <Group justify="space-between" grow>
      <Stack
        style={{
          flex: 1,
        }}
      >
        <Text>{rule.name}</Text>
        <Text size="sm" c="dimmed" fw={400}>
          {rule.description}
        </Text>
      </Stack>
    </Group>
  );
}
