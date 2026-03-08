import { useCategory } from "@guallet/api-react"
import type { LucideIcon } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { createElement } from "react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const DEFAULT_CATEGORY_COLOUR = "#999999"
const FALLBACK_ICON = LucideIcons.CircleQuestionMarkIcon
const FALLBACK_ICON_NAME = "CircleQuestionMarkIcon"
const NO_CATEGORY_ICON_NAME = "CircleAlertIcon"
const NO_CATEGORY_COLOUR = "#f59e0b"
const LUCIDE_ICONS = LucideIcons as unknown as Record<string, LucideIcon>

type CategoryAvatarProps = {
  categoryId: string | null
  className?: string
  size?: "default" | "sm" | "lg"
}

export function CategoryAvatar({
  categoryId,
  className,
  size = "sm",
}: Readonly<CategoryAvatarProps>) {
  const { category } = useCategory(categoryId)
  const categoryName = resolveCategoryName(categoryId, category?.name)

  const iconName =
    categoryId === null
      ? NO_CATEGORY_ICON_NAME
      : resolveCategoryIconName(category?.icon)
  const iconColour =
    categoryId === null
      ? NO_CATEGORY_COLOUR
      : resolveCategoryColour(category?.colour)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar size={size} className={className}>
          <AvatarFallback className="bg-muted">
            <DynamicCategoryIcon
              iconName={iconName}
              iconColour={iconColour}
              className={cn(getIconSizeClassName(size), "shrink-0")}
            />
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{categoryName}</TooltipContent>
    </Tooltip>
  )
}

function resolveCategoryName(categoryId: string | null, name?: string | null) {
  const safeName = name?.trim()

  if (safeName) {
    return safeName
  }

  return categoryId === null ? "untagged" : "unknown category"
}

function resolveCategoryColour(colour?: string | null) {
  const safeColour = colour?.trim()

  return safeColour || DEFAULT_CATEGORY_COLOUR
}

function resolveCategoryIconName(iconName?: string | null): string {
  const resolvedName = resolveIconName(iconName)

  if (!resolvedName) {
    return FALLBACK_ICON_NAME
  }

  return resolvedName
}

function resolveIconName(iconName?: string | null): string | null {
  const safeIconName = iconName?.trim()

  if (!safeIconName) {
    return null
  }

  const candidates = new Set<string>([safeIconName, `${safeIconName}Icon`])

  if (safeIconName.startsWith("Icon")) {
    const withoutTablerPrefix = safeIconName.slice(4)

    if (withoutTablerPrefix) {
      candidates.add(withoutTablerPrefix)
      candidates.add(`${withoutTablerPrefix}Icon`)
    }
  }

  if (safeIconName.endsWith("Icon")) {
    const withoutIconSuffix = safeIconName.slice(0, -4)

    if (withoutIconSuffix) {
      candidates.add(withoutIconSuffix)
    }
  }

  const pascalCaseName = toPascalCase(
    safeIconName.replace(/^Icon/, "").replace(/Icon$/, "")
  )

  if (pascalCaseName) {
    candidates.add(pascalCaseName)
    candidates.add(`${pascalCaseName}Icon`)
  }

  for (const candidate of candidates) {
    if (candidate in LUCIDE_ICONS) {
      return candidate
    }
  }

  return null
}

function toPascalCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => `${segment[0]?.toUpperCase() ?? ""}${segment.slice(1)}`)
    .join("")
}

function getIconSizeClassName(size: "default" | "sm" | "lg") {
  switch (size) {
    case "sm":
      return "size-3.5"
    case "lg":
      return "size-5"
    default:
      return "size-4"
  }
}

function DynamicCategoryIcon({
  iconName,
  iconColour,
  className,
}: Readonly<{
  iconName: string
  iconColour: string
  className?: string
}>) {
  const iconComponent = LUCIDE_ICONS[iconName] ?? FALLBACK_ICON

  return createElement(iconComponent, {
    "aria-hidden": "true",
    className,
    style: { color: iconColour },
  })
}
