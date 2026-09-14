import type { ComponentProps } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable } from 'react-native';
import type { BottomTabBarButtonProps } from 'expo-router/build/react-navigation/bottom-tabs/types';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <Pressable
      {...(props as unknown as ComponentProps<typeof Pressable>)}
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
