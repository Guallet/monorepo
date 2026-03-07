import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface WidgetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

function triggerClickFromKeyboard(
  event: React.KeyboardEvent<HTMLDivElement>,
  onClick?: () => void,
) {
  if (!onClick) {
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
}

export function WidgetCard({
  onClick,
  title,
  children,
  icon,
  action,
  className,
  onKeyDown,
  ...props
}: Readonly<WidgetCardProps>) {
  return (
    <Card
      className={cn(
        'flex h-full flex-col rounded-xl transition-all',
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          : '',
        className,
      )}
      onClick={onClick}
      onKeyDown={(event) => {
        triggerClickFromKeyboard(event, onClick);
        onKeyDown?.(event);
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          {icon ? <span className="text-blue-600">{icon}</span> : null}
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </CardTitle>
        </div>
        {action ? <div>{action}</div> : null}
      </CardHeader>

      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
