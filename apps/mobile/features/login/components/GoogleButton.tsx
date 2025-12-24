import { Button, useTheme } from "@luna-ui/react-native";
import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Label } from "@luna-ui/react-native/src/components/typography";
import { Group } from "@luna-ui/react-native/src/components/layout/Group";

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
        <Ionicons name="logo-google" size={32} color={colors.primary} />
        <Label color={colors.primary}>Continue with Google</Label>
      </Group>
    </Button>
  );
};
