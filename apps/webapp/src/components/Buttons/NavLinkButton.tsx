//Source: https://tanstack.com/router/latest/docs/framework/react/guide/custom-link#link

import * as React from 'react';
import { createLink, LinkComponent } from '@tanstack/react-router';
import { Anchor, AnchorProps } from '@mantine/core';

type MantineAnchorProps = Omit<AnchorProps, 'href'>;

const MantineLinkComponent = React.forwardRef<
  HTMLAnchorElement,
  MantineAnchorProps
>((props, ref) => {
  return <Anchor ref={ref} {...props} />;
});

const CreatedLinkComponent = createLink(MantineLinkComponent);

export const NavLinkButton: LinkComponent<typeof MantineLinkComponent> = (
  props,
) => {
  return <CreatedLinkComponent {...props} />;
};
