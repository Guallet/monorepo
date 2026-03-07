// Source: https://tanstack.com/router/latest/docs/framework/react/guide/custom-link#link

import * as React from 'react';
import { createLink, LinkComponent } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

type NavAnchorProps = React.ComponentPropsWithoutRef<'a'> & {
  size?: 'sm' | 'md' | 'lg';
};

const navAnchorSizeClass: Record<
  NonNullable<NavAnchorProps['size']>,
  string
> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const NavAnchorComponent = React.forwardRef<HTMLAnchorElement, NavAnchorProps>(
  ({ className, size = 'md', ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'font-medium text-primary hover:underline',
          navAnchorSizeClass[size],
          className,
        )}
        {...props}
      />
    );
  },
);
NavAnchorComponent.displayName = 'NavAnchorComponent';

const CreatedLinkComponent = createLink(NavAnchorComponent);

export const NavLinkButton: LinkComponent<typeof NavAnchorComponent> = (
  props,
) => {
  return <CreatedLinkComponent {...props} />;
};
