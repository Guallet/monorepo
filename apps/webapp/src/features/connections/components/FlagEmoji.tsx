interface FlagEmojiProps {
  countryCode: string;
}

export function FlagEmoji({ countryCode }: Readonly<FlagEmojiProps>) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + (char.codePointAt(0) ?? 0));
  return <span>{String.fromCodePoint(...codePoints)}</span>;
}
