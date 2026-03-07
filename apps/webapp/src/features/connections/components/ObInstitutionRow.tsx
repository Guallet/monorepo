import { ObInstitutionDto } from "@guallet/api-client";
import { TextRow } from "@guallet/ui-react";

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
      leftSection={
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted">
          {institution.logo ? (
            <img
              src={institution.logo}
              alt={institution.name}
              className="h-full w-full object-cover"
            />
          ) : null}
        </span>
      }
      {...props}
    />
  );
}
