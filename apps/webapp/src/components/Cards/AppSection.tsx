import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AppSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  itemPadding?: number | string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  gap?: number | string;
}

const paddingByToken: Record<string, string> = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

function getPaddingClass(itemPadding: number | string): string {
  if (typeof itemPadding !== 'string') {
    return '';
  }

  return paddingByToken[itemPadding] ?? '';
}

export function AppSection({
  title,
  children,
  itemPadding = 'md',
  headerActions,
  className,
  style,
  gap,
  ...props
}: Readonly<AppSectionProps>) {
  const paddingClass = getPaddingClass(itemPadding);
  let dynamicPaddingStyle: React.CSSProperties | undefined;

  if (typeof itemPadding === 'number' || paddingClass === '') {
    dynamicPaddingStyle = { padding: itemPadding };
  }

  const rootGapClass = gap === 0 || gap === '0' ? 'space-y-0' : 'space-y-2';

  return (
    <div className={cn(rootGapClass)}>
      {title && (
        <div className="flex items-center justify-between gap-2 px-4 py-1">
          <h2 className="flex-1 text-base font-bold">{title}</h2>
          {headerActions}
        </div>
      )}

      <Card
        className={cn('rounded-lg border shadow-sm', className)}
        style={style}
      >
        <div
          className={cn(paddingClass)}
          style={dynamicPaddingStyle}
          {...props}
        >
          {children}
        </div>
      </Card>
    </div>
  );
}
