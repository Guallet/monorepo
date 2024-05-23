import { useAccount, useInstitution } from "@guallet/api-react";
import { Avatar, AvatarProps } from "@mantine/core";

interface AccountAvatarProps extends AvatarProps {
  accountId: string;
}

export function AccountAvatar({ accountId, ...props }: AccountAvatarProps) {
  const { account } = useAccount(accountId);
  const { institution } = useInstitution(account?.institutionId);

  return (
    <Avatar src={institution?.image_src} alt={institution?.name} {...props} />
  );
}
