import { BaseRow } from "@guallet/ui-react";

interface DataImporterItemProps extends React.ComponentProps<typeof BaseRow> {
  description: string;
}

export function DataImporterItem({
  description,
  ...props
}: Readonly<DataImporterItemProps>) {
  return <BaseRow value={description} {...props} />;
}
