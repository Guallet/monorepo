import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { Label } from "../Text";

const blurHash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

interface AvatarProps extends React.ComponentProps<typeof View> {
  imageUrl?: string;
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
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      {...props}
    >
      {/* TODO: Change this to a default generic image */}
      {imageError && (
        <Label style={{ fontSize: size / 2 }}>
          {alt?.charAt(0).toUpperCase()}
        </Label>
      )}
      {!imageError && (
        <Image
          source={{ uri: imageUrl }}
          alt={alt}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: size / 2,
          }}
          placeholder={blurHash}
          onError={() => setImageError(true)}
        />
      )}
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
