import { useAccount, useInstitution } from "@guallet/api-react";
import { Avatar, AvatarProps, Tooltip } from "@mantine/core";
import { IconBuildingBank } from "@tabler/icons-react";

interface AccountAvatarProps extends AvatarProps {
  accountId: string;
  showTooltip?: boolean;
}

export function AccountAvatar({
  accountId,
  showTooltip = false,
  ...props
}: Readonly<AccountAvatarProps>) {
  const { account } = useAccount(accountId);
  const { institution } = useInstitution(account?.institutionId);

  if (showTooltip && institution?.name) {
    const tooltipLabel = institution?.name;
    return (
      <Tooltip label={tooltipLabel}>
        <InnerAccountAvatar accountId={accountId} {...props} />
      </Tooltip>
    );
  }

  return <InnerAccountAvatar accountId={accountId} {...props} />;
}

function InnerAccountAvatar({
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
