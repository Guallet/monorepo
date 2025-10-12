import {
  Button,
  LunaLightThemeColors,
  LunaSpacingMap,
} from "@luna-ui/react-native";
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Label } from "@luna-ui/react-native/src/components/typography";

interface GoogleButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const GoogleButton: React.FC<GoogleButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <Button
      variant="outline"
      //   style={[styles.button, disabled && styles.disabled]}
      onClick={onPress}
      disabled={disabled}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: LunaSpacingMap.md,
        }}
      >
        <Ionicons
          name="logo-google"
          size={32}
          color={LunaLightThemeColors.primary}
        />
        <Label color={LunaLightThemeColors.primary}>Continue with Google</Label>
      </View>
    </Button>
  );
};
