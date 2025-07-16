import { BaseRow } from "./BaseRow";
import { Label } from "../Text";

interface TextRowProps extends React.ComponentProps<typeof BaseRow> {
  label: string;
}

export function TextRow({ label, ...props }: Readonly<TextRowProps>) {
  return (
    <BaseRow {...props}>
      <Label variant="body">{label}</Label>
    </BaseRow>
  );
}
