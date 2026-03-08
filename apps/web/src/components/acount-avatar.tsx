import { useAccount, useInstitution } from "@guallet/api-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function AcountAvatar({ accountId }: { accountId: string }) {
  const { account } = useAccount(accountId)
  const { institution } = useInstitution(account?.institutionId)

  const institutionLogo = institution?.image_src?.trim() || undefined
  const initials = getInitials(account?.name)
  const accountName = account?.name ?? "Account"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar size="sm">
          {institutionLogo ? (
            <AvatarImage
              src={institutionLogo}
              alt={institution?.name ?? account?.name}
            />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{accountName}</TooltipContent>
    </Tooltip>
  )
}

function getInitials(name?: string | null) {
  const safeName = name?.trim()

  if (!safeName) {
    return "?"
  }

  const parts = safeName.split(/\s+/).filter(Boolean)

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}
