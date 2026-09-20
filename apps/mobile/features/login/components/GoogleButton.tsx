import { Button, Group, Label, useTheme } from '@guallet/luna-ui';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const { colors } = useTheme();

  return (
    <Button variant="outline" onClick={onPress} disabled={disabled}>
      <Group align="center" gap="sm">
        <Ionicons name="logo-google" size={32} color={colors.accent.primary} />
        <Label color={colors.accent.primary}>Continue with Google</Label>
      </Group>
    </Button>
  );
};
