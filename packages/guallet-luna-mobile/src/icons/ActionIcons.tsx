import TablerChevronDownIcon from '@tabler/icons-react-native/IconChevronDown';
import TablerChevronRightIcon from '@tabler/icons-react-native/IconChevronRight';
import TablerSearchIcon from '@tabler/icons-react-native/IconSearch';
import TablerXIcon from '@tabler/icons-react-native/IconX';
import type { IconProps } from '@tabler/icons-react-native';
import type { ComponentType, FC } from 'react';

function createLunaIcon(
  IconComponent: ComponentType<IconProps>,
  displayName: string,
): FC<IconProps> {
  const LunaIcon: FC<IconProps> = (props) => (
    <IconComponent strokeWidth={1.5} {...props} />
  );
  LunaIcon.displayName = displayName;
  return LunaIcon;
}

export const ChevronDownIcon = createLunaIcon(
  TablerChevronDownIcon,
  'ChevronDownIcon',
);
export const ChevronRightIcon = createLunaIcon(
  TablerChevronRightIcon,
  'ChevronRightIcon',
);
export const CloseIcon = createLunaIcon(TablerXIcon, 'CloseIcon');
export const SearchIcon = createLunaIcon(TablerSearchIcon, 'SearchIcon');
