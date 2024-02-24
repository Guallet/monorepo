import { ButtonProps, PrimaryButton } from "./PrimaryButton";

export function SecondaryButton({
  title,
  onClick,
  style,
  leftIconName,
  rightIconName,
}: ButtonProps) {
  return (
    <PrimaryButton
      title={title}
      onClick={onClick}
      style={[
        {
          backgroundColor: "transparent",
        },
        style,
      ]}
      tint="blue"
      leftIconName={leftIconName}
      rightIconName={rightIconName}
    />
  );
}
