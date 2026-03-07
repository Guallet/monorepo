import { useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { CategoryDataRowDto } from './cashflow.models';

interface IProps {
  row: CategoryDataRowDto;
}

export function CashFlowRow({ row }: Readonly<IProps>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canExpand = row.subcategories.length > 0;

  const parentRow = (
    <tr
      key={`${row.categoryId}-parent`}
      className={row.isParent ? 'font-semibold' : undefined}
    >
      <td className="px-3 py-2">
        {canExpand ? (
          <button
            type="button"
            className="flex items-center gap-2 text-left"
            onClick={() => {
              setIsExpanded((prev) => !prev);
            }}
          >
            {isExpanded ? (
              <IconChevronDown size={15} />
            ) : (
              <IconChevronRight size={15} />
            )}
            <span>{row.categoryName}</span>
          </button>
        ) : (
          <span className="pl-5">{row.categoryName}</span>
        )}
      </td>
      {row.values.map((value, index) => (
        <td key={`${row.categoryId}-value-${index}`} className="px-3 py-2">
          {value}
        </td>
      ))}
    </tr>
  );

  if (!isExpanded) {
    return parentRow;
  }

  return (
    <>
      {parentRow}
      {row.subcategories.map((subCategory) => (
        <tr
          key={`${row.categoryId}-${subCategory.categoryId}`}
          className="text-muted-foreground"
        >
          <td className="px-3 py-2 pl-8">{subCategory.categoryName}</td>
          {subCategory.values.map((value, index) => (
            <td
              key={`${subCategory.categoryId}-value-${index}`}
              className="px-3 py-2"
            >
              {value}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
