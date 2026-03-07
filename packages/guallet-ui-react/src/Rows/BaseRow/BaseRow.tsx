import { IconChevronRight } from '@tabler/icons-react';
import classes from './BaseRow.module.css';

interface BaseRowProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onClick'
> {
  label: string;
  value?: React.ReactNode;
  onClick?: () => void;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export function BaseRow({
  label,
  value,
  onClick,
  leftSection,
  rightSection,
  className,
  ...props
}: Readonly<BaseRowProps>) {
  const rightSectionContent =
    rightSection || (onClick ? <IconChevronRight size={16} /> : null);

  const classNameValue = [classes.baseRow, className].filter(Boolean).join(' ');

  if (onClick) {
    return (
      <button
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        className={[classNameValue, classes.interactive].join(' ')}
        onClick={onClick}
        type="button"
      >
        <div className={classes.leftGroup}>
          {leftSection}
          <span className={classes.label}>{label}</span>
        </div>

        <div className={classes.rightGroup}>
          {value}
          {rightSectionContent}
        </div>
      </button>
    );
  }

  return (
    <div {...props} className={classNameValue}>
      <div className={classes.leftGroup}>
        {leftSection}
        <span className={classes.label}>{label}</span>
      </div>

      <div className={classes.rightGroup}>
        {value}
        {rightSectionContent}
      </div>
    </div>
  );
}
