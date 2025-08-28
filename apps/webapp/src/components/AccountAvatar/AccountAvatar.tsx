import { useAccount, useInstitution } from "@guallet/api-react";
import { Avatar, AvatarProps } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";

interface AccountAvatarProps extends AvatarProps {
  accountId: string;
}

export function AccountAvatar({
  accountId,
  ...props
}: Readonly<AccountAvatarProps>) {
  const { account } = useAccount(accountId);
  const { institution } = useInstitution(account?.institutionId);

  return (
    <Avatar src={institution?.image_src} alt={institution?.name} {...props}>
      <IconBuildingBank />
    </Avatar>
  );
}
