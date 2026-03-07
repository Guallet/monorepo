import { useState } from 'react';
import { Icon, IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

interface LinksGroupProps {
  icon: Icon;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  subLinks?: { label: string; link: string }[];
  onItemSelected: () => void;
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  link,
  subLinks,
  onItemSelected,
}: Readonly<LinksGroupProps>) {
  const hasLinks = Array.isArray(subLinks) && subLinks.length > 0;
  const [opened, setOpened] = useState(Boolean(initiallyOpened));

  const navigation = useNavigate();

  const items = (hasLinks ? subLinks : []).map((subLink) => (
    <button
      type="button"
      className="ml-8 block w-[calc(100%-2rem)] border-l border-border px-4 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      key={subLink.label}
      onClick={() => {
        onItemSelected();
        navigation({ to: subLink.link });
      }}
    >
      {subLink.label}
    </button>
  ));

  const onMainPress = () => {
    if (hasLinks) {
      setOpened((current) => !current);
    }

    if (link) {
      navigation({ to: link });
      onItemSelected();
    }
  };

  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        onClick={onMainPress}
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <span>{label}</span>
        </span>

        {hasLinks ? (
          <IconChevronRight
            stroke={1.5}
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform duration-200',
              opened ? '-rotate-90' : 'rotate-0',
            )}
          />
        ) : null}
      </button>

      {hasLinks && opened ? <div className="pb-1">{items}</div> : null}
    </div>
  );
}
