import { ActivityIndicator, Modal, View } from 'react-native';
import { Label } from './../../src/components/typography';
import { useTheme } from '../theme';

interface OverlayLoaderProps extends React.ComponentProps<typeof Modal> {
  isVisible: boolean;
  loadingMessage?: string;
}

export function ModalLoaderOverlay({
  isVisible,
  loadingMessage,
  ...props
}: Readonly<OverlayLoaderProps>) {
  const { colors, borderRadius, spacing, typography } = useTheme();

  return (
    <Modal
      transparent={true}
      animationType="fade"
      {...props}
      visible={isVisible}
      onRequestClose={() => {
        // do nothing... this is controlled by the parent.
        // The user cannot dismiss this view
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.overlay,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            padding: spacing.xl,
            borderRadius: borderRadius.xl,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          {loadingMessage && (
            <Label
              style={{
                color: colors.text,
                fontSize: typography.sizes.md,
                marginTop: spacing.sm,
              }}
            >
              {loadingMessage}
            </Label>
          )}
        </View>
      </View>
    </Modal>
  );
}
