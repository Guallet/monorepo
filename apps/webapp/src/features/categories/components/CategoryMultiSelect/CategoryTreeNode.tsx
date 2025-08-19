import { CategoryIcon } from "@/components/Categories/CategoryIcon";
import { useCategory } from "@guallet/api-react";
import { Checkbox, Group, RenderTreeNodePayload, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";

export function CategoryTreeNode({
  node,
  expanded,
  hasChildren,
  elementProps,
  tree,
}: Readonly<RenderTreeNodePayload>) {
  const checked = tree.isNodeChecked(node.value);
  const indeterminate = tree.isNodeIndeterminate(node.value);

  const { category } = useCategory(node.value);

  return (
    <Group gap="xs" {...elementProps}>
      <Checkbox.Indicator
        checked={checked}
        indeterminate={indeterminate}
        onClick={() =>
          !checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value)
        }
      />

      <Group gap={5} onClick={() => tree.toggleExpanded(node.value)}>
        <CategoryIcon categoryId={node.value} />
        <Text>{node.label}</Text>

        {hasChildren && (
          <IconChevronDown
            size={14}
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        )}
      </Group>
    </Group>
  );
}
