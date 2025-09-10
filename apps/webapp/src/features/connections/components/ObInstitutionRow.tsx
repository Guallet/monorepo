import { ObInstitutionDto } from "@guallet/api-client";
import { TextRow } from "@guallet/ui-react";
import { Avatar } from "@mantine/core";

interface BankCardProps
  extends Omit<React.ComponentProps<typeof TextRow>, "label"> {
  institution: ObInstitutionDto;
}
export function ObInstitutionRow({
  institution,
  ...props
}: Readonly<BankCardProps>) {
  return (
    <TextRow
      label={institution.name}
      leftSection={<Avatar src={institution.logo} />}
      {...props}
    />
  );
}
