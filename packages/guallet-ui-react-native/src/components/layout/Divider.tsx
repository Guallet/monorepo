import { View } from 'react-native';
import { Label } from '../typography';
import Group from './Group';
import { useTheme } from '../../theme';

interface DividerProps extends React.ComponentProps<typeof View> {
  color?: string;
  width?: number;
  label?: string;
}

export function Divider({
  color,
  width = 1,
  label,
  style,
}: Readonly<DividerProps>) {
  const { spacing, colors } = useTheme();
  const dividerColor = color ?? colors.surface.border.primary;

  if (!label) {
    return (
      <View
        style={[
          {
            borderBottomColor: dividerColor,
            borderBottomWidth: width,
          },
          style,
        ]}
      />
    );
  }

  return (
    <Group>
      <View
        style={[
          {
            flexGrow: 1,
            borderBottomColor: dividerColor,
            borderBottomWidth: width,
          },
          style,
        ]}
      />
      <Label style={{ paddingHorizontal: spacing.sm }}>{label}</Label>
      <View
        style={[
          {
            flexGrow: 1,
            borderBottomColor: dividerColor,
            borderBottomWidth: width,
          },
          style,
        ]}
      />
    </Group>
  );
}
