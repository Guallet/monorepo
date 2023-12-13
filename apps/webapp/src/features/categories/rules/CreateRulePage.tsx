import { useLoaderData } from "react-router-dom";
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Input,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { Category } from "../models/Category";
import { loadCategories } from "../api/categories.api";
import { notifications } from "@mantine/notifications";
import {
  RuleConditionsOperator,
  RuleConditionsOperatorValues,
  TransactionField,
  TransactionFieldValues,
} from "./RulesEngine";
import { useState } from "react";
import { IconTrash } from "@tabler/icons-react";

interface CreateRuleData {
  categories: Category[];
}

export async function loader() {
  const categories = await loadCategories();

  return { categories } as CreateRuleData;
}

export type EditableRuleCondition = {
  id: number;
  field: TransactionFieldValues | null;
  operator: RuleConditionsOperator | null;
  value: string | null;
};

export function CreateRulePage() {
  const { categories } = useLoaderData() as CreateRuleData;

  const [counter, setCounter] = useState(1);

  const flatCategories = [...new Set(categories.map((c) => c.name))];
  const [conditions, setConditions] = useState<EditableRuleCondition[]>([
    {
      id: counter,
      field: null,
      operator: null,
      value: null,
    },
  ]);

  const properties = Object.keys(TransactionField).map((i) => i);
  const operators = Object.values(RuleConditionsOperatorValues).map((i) => i);

  return (
    <Stack>
      <Text>Rules</Text>
      <Text>When</Text>

      {conditions.map((condition, index) => {
        return (
          <Stack>
            {index > 0 && <Divider label="and" labelPosition="left" />}
            <Group key={condition.id} grow>
              <Select
                placeholder="Select property"
                data={properties}
                value={condition.field}
              />
              <Select
                placeholder="Select operator"
                data={operators}
                value={condition.operator}
              />
              <Input
                placeholder="Value"
                style={{
                  flexGrow: 1,
                }}
              />
              <ActionIcon
                variant="filled"
                color="red"
                onClick={() => {
                  const clone = [...conditions];
                  const index = clone.findIndex((c) => c.id === condition.id);
                  clone.splice(index, 1);
                  setConditions(clone);
                }}
              >
                <IconTrash />
              </ActionIcon>
            </Group>
          </Stack>
        );
      })}

      <Button
        onClick={() => {
          const newCounter = counter + 1;
          setCounter(newCounter);
          setConditions([
            ...conditions,
            { id: newCounter, field: null, operator: null, value: null },
          ]);
        }}
      >
        + Add condition
      </Button>
      <Text>Then Category is</Text>
      <Select
        placeholder="Select category"
        data={flatCategories}
        clearable
        allowDeselect
        searchable
        nothingFoundMessage="Nothing found..."
      />

      <Button
        onClick={() => {
          notifications.show({
            title: "Not implemented yet",
            message:
              "This is not implemented yet... it should be behind a feature flag",
            color: "red",
          });
        }}
      >
        Save
      </Button>
    </Stack>
  );
}
