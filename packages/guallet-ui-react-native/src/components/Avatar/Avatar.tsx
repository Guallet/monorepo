import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

interface AvatarProps extends React.ComponentProps<typeof View> {
  imageUrl: string;
  alt?: string;
  size?: number;
}

export function Avatar({
  imageUrl,
  alt,
  size = 24,
  style,
  ...props
}: AvatarProps) {
  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      {...props}
    >
      <Image
        source={{ uri: imageUrl }}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: size / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
});
