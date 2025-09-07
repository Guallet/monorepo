import { useInstitution } from "@guallet/api-react";
import { Avatar, AvatarProps } from "@mantine/core";

interface InstitutionLogoProps extends AvatarProps {
  institutionId: string;
}

export function InstitutionLogo({
  institutionId,
  ...props
}: Readonly<InstitutionLogoProps>) {
  const { institution } = useInstitution(institutionId);

  return (
    <Avatar src={institution?.image_src} alt={institution?.name} {...props} />
  );
}
