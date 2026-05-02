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
  color = 'black',
  width = 1,
  label,
  style,
}: Readonly<DividerProps>) {
  const { spacing } = useTheme();

  if (!label) {
    return (
      <View
        style={[
          {
            borderBottomColor: color,
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
            borderBottomColor: color,
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
            borderBottomColor: color,
            borderBottomWidth: width,
          },
          style,
        ]}
      />
    </Group>
  );
}
