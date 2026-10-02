import { Button, Group, Label, useTheme } from '@guallet/luna-mobile';
import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Button variant="outline" onClick={onPress} disabled={disabled}>
      <Group align="center" gap="sm">
        <Ionicons name="logo-google" size={20} color={colors.accent.primary} />
        <Label color={colors.accent.primary}>{t('Continue with Google')}</Label>
      </Group>
    </Button>
  );
};
