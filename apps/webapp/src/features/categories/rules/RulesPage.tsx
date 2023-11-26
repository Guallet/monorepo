import { useLoaderData } from "react-router-dom";
import { CategoryRule } from "./RulesEngine";
import {
  Accordion,
  ActionIcon,
  Avatar,
  Button,
  Group,
  List,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { RuleDto, loadRules } from "./api/rules.api";
import { loadCategories } from "../api/categories.api";
import { Category } from "../models/Category";
import { IconEdit, IconEditCircleOff, IconTrash } from "@tabler/icons-react";

interface RulesPageData {
  rules: RuleDto[];
  categories: Category[];
}

export async function loader() {
  const rules = await loadRules();
  const categories = await loadCategories();

  return { rules, categories } as unknown as RulesPageData;
}

export function RulesPage() {
  const { rules } = useLoaderData() as RulesPageData;

  return (
    <Stack>
      <Text>Rules</Text>
      <Button>Create new rule</Button>
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
      <Accordion.Control>
        <AccordionLabel rule={rule} />
      </Accordion.Control>
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
      <Group
        justify="flex-end"
        style={{
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
    </Group>
  );
}
