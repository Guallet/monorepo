import { CategoryIcon } from "@/components/Categories/CategoryIcon";
import { Checkbox } from '@/components/ui/checkbox';
import { IconChevronDown } from "@tabler/icons-react";
import type { HTMLAttributes, ReactNode } from 'react';

interface CategoryTreeLike {
  isNodeChecked: (nodeId: string) => boolean;
  isNodeIndeterminate: (nodeId: string) => boolean;
  checkNode: (nodeId: string) => void;
  uncheckNode: (nodeId: string) => void;
  toggleExpanded: (nodeId: string) => void;
}

interface CategoryTreeNodePayload {
  node: {
    value: string;
    label: ReactNode;
  };
  expanded: boolean;
  hasChildren: boolean;
  elementProps?: HTMLAttributes<HTMLDivElement>;
  tree: CategoryTreeLike;
}

export function CategoryTreeNode({
  node,
  expanded,
  hasChildren,
  elementProps,
  tree,
}: Readonly<CategoryTreeNodePayload>) {
  const checked = tree.isNodeChecked(node.value);
  const indeterminate = tree.isNodeIndeterminate(node.value);

  return (
    <div className="flex items-center gap-2" {...elementProps}>
      <Checkbox
        checked={checked}
        onCheckedChange={(value) => {
          const shouldCheck = value === true || value === 'indeterminate';
          if (shouldCheck || indeterminate) {
            tree.checkNode(node.value);
          } else {
            tree.uncheckNode(node.value);
          }
        }}
      />

      <button
        type="button"
        className="flex items-center gap-1"
        onClick={() => tree.toggleExpanded(node.value)}
      >
        <CategoryIcon categoryId={node.value} />
        <span>{node.label}</span>

        {hasChildren && (
          <IconChevronDown
            size={14}
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        )}
      </button>
    </div>
  );
}
