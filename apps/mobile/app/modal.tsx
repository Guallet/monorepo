import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NativeBottomSheet } from '@/components/ui/native-bottom-sheet';
import { useTheme } from '@guallet/luna-mobile';

export default function ModalScreen() {
  const { colors, spacing, typography } = useTheme();

  return (
    <NativeBottomSheet
      visible
      onClose={() => router.back()}
      snapPoints={['half']}
      testID="modal-bottom-sheet"
    >
      <View style={[styles.container, { padding: spacing.lg }]}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.sizes.xl,
            fontWeight: '700',
          }}
        >
          This is a bottom sheet
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[
            styles.closeButton,
            {
              backgroundColor: colors.accent.primary,
              borderRadius: 12,
              marginTop: spacing.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            },
          ]}
        >
          <Text
            style={{
              color: colors.button.onPrimary.default,
              fontSize: typography.sizes.md,
              fontWeight: '600',
            }}
          >
            Close
          </Text>
        </Pressable>
      </View>
    </NativeBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    width: '100%',
  },
});
