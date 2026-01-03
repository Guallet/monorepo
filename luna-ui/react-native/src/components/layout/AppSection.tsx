import { View } from 'react-native';
import { Title } from '../typography';
import { Visibility } from '../Visibility';
import { useTheme } from './../../../src/theme';

interface AppSectionProps extends React.ComponentProps<typeof View> {
  title: string;
}

export function AppSection({
  title,
  children,
  ...props
}: Readonly<AppSectionProps>) {
  const { colors, spacing } = useTheme();

  return (
    <View {...props}>
      <Visibility
        isVisible={!!title}
        style={{ marginBottom: spacing.sm, paddingLeft: spacing.sm }}
      >
        <Title>{title}</Title>
      </Visibility>
      <View
        style={{
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderRadius: spacing.sm,
        }}
      >
        {children}
      </View>
    </View>
  );
}
