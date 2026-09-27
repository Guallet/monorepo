import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useInstitution } from '@guallet/api-react';
import { useTheme } from '@guallet/luna-mobile';
import { getAccountHue, getAccountInitials } from '../models/account';

export function InstitutionAvatar({
  institutionId,
  fallbackName,
  size = 48,
}: Readonly<{
  institutionId: string;
  fallbackName: string;
  size?: number;
}>) {
  const { colors } = useTheme();
  const { institution } = useInstitution(institutionId);
  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);
  const imageUri = institution?.image_src;
  const showImage = !!imageUri && failedImageUri !== imageUri;
  const hue = getAccountHue(fallbackName);

  return (
    <View
      accessible
      accessibilityLabel={institution?.name ?? fallbackName}
      accessibilityRole="image"
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: showImage
            ? colors.surface.background.primary
            : `hsl(${hue}, 55%, 92%)`,
          borderColor: showImage
            ? colors.surface.border.primary
            : `hsl(${hue}, 45%, 70%)`,
        },
      ]}
    >
      {showImage ? (
        <Image
          accessible={false}
          onError={() => setFailedImageUri(imageUri ?? null)}
          resizeMode="contain"
          source={{ uri: imageUri }}
          style={styles.logo}
        />
      ) : (
        <Text
          style={[
            styles.initials,
            { color: `hsl(${hue}, 45%, 32%)`, fontSize: size * 0.3 },
          ]}
        >
          {getAccountInitials(fallbackName)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  logo: {
    height: '72%',
    width: '72%',
  },
});
