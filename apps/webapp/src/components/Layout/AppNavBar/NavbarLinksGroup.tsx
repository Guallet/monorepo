import { useState } from 'react';
import { Box, Collapse, UnstyledButton, rem } from '@mantine/core';
import { Icon, IconChevronDown } from '@tabler/icons-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import classes from './NavbarLinksGroup.module.css';

interface LinksGroupProps {
  icon: Icon;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  subLinks?: { label: string; link: string }[];
  onItemSelected: () => void;
}

function isPathActive(itemPath: string, currentPath: string): boolean {
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
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
  const navigate = useNavigate();
  const { location } = useRouterState();
  const currentPath = location.pathname;

  const isDirectlyActive = !!link && isPathActive(link, currentPath);
  const hasActiveSub =
    hasLinks && subLinks!.some((sub) => isPathActive(sub.link, currentPath));

  const [manuallyOpened, setManuallyOpened] = useState(initiallyOpened || false);
  const opened = manuallyOpened || hasActiveSub;

  const items = (hasLinks ? subLinks! : []).map((sub) => {
    const isSubActive = isPathActive(sub.link, currentPath);
    return (
      <UnstyledButton
        key={sub.label}
        className={classes.subLink}
        data-active={isSubActive || undefined}
        onClick={() => {
          navigate({ to: sub.link });
          onItemSelected();
        }}
      >
        {isSubActive && <span className={classes.dot} />}
        <span style={{ paddingLeft: isSubActive ? 0 : rem(12) }}>{sub.label}</span>
      </UnstyledButton>
    );
  });

  return (
    <>
      <UnstyledButton
        className={classes.control}
        data-active={(isDirectlyActive || hasActiveSub) || undefined}
        onClick={() => {
          if (hasLinks) {
            setManuallyOpened((isOpened) => !isOpened);
          } else if (link) {
            navigate({ to: link });
            onItemSelected();
          }
        }}
      >
        <Icon style={{ width: rem(18), height: rem(18), flexShrink: 0 }} />
        <Box style={{ flex: 1 }}>{label}</Box>
        {hasLinks && (
          <IconChevronDown
            className={classes.chevron}
            stroke={1.8}
            style={{
              width: rem(16),
              height: rem(16),
              transform: opened ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        )}
      </UnstyledButton>
      {hasLinks && (
        <Collapse expanded={opened}>
          <Box className={classes.subLinksContainer}>{items}</Box>
        </Collapse>
      )}
    </>
  );
}
