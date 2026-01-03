import { View, StyleSheet } from 'react-native';
import { useTheme } from './../../../src/theme';
import { Label } from '../typography';
import { Visibility } from '../Visibility';

interface GroupHeaderProps extends React.ComponentProps<typeof View> {
  title: string;
  rightContent: string | null;
}

export function GroupHeader({
  title,
  rightContent = null,
}: Readonly<GroupHeaderProps>) {
  const { spacing, colors } = useTheme();

  return (
    <View
      style={{
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: colors.background,
        height: 50,
        paddingTop: spacing.md,
        paddingHorizontal: spacing.md,
        backgroundColor: 'white',
        borderTopStartRadius: spacing.sm,
        borderTopEndRadius: spacing.sm,
      }}
    >
      <Label style={styles.label}>{title}</Label>
      <Visibility isVisible={rightContent !== null && rightContent !== ''}>
        <Label style={styles.label}>{rightContent}</Label>
      </Visibility>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
});
