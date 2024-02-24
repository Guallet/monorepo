import { ButtonProps, PrimaryButton } from "./PrimaryButton";

export function DangerButton({ title, onClick, style }: ButtonProps) {
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
      tint="red"
      rightIconName="warning"
    />
  );
}
