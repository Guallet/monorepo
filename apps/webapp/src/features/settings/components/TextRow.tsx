import { BaseRow } from "./BaseRow/BaseRow";

interface TextRowProps extends React.ComponentProps<typeof BaseRow> {
  label: string;
  value?: string;
}
export function TextRow({ label, value, ...props }: Readonly<TextRowProps>) {
  return (
    <BaseRow
      label={label}
      value={value}
      onClick={() => {
        console.log("Text clicked");
      }}
      {...props}
    />
  );
}
