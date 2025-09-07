import { useInstitution } from "@guallet/api-react";
import { Avatar } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";

export function InstitutionAvatar({
  institutionId,
  ...props
}: Readonly<{
  institutionId: string;
}>) {
  const { institution } = useInstitution(institutionId);
  return (
    <Avatar src={institution?.image_src} alt={institution?.name} {...props}>
      <IconBuildingBank />
    </Avatar>
  );
}
