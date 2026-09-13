import type { ComponentProps } from 'react';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs/types';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...(props as unknown as ComponentProps<typeof PlatformPressable>)}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
