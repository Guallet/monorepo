import { Text } from "@mantine/core";
interface FlagEmojiProps {
  countryCode: string;
}

export function FlagEmoji({ countryCode }: Readonly<FlagEmojiProps>) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return <Text>{String.fromCodePoint(...codePoints)}</Text>;
}
