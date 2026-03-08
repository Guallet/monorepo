import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  BookOpenIcon,
  Settings2Icon,
  LandmarkIcon,
  ArrowRightLeftIcon,
  TargetIcon,
  Repeat2Icon,
  ChartLineIcon,
  WrenchIcon,
  LayoutDashboardIcon,
  FunnelIcon,
} from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: <GalleryVerticalEndIcon />,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: <AudioLinesIcon />,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: <TerminalIcon />,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
      isActive: true,
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: <LandmarkIcon />,
      items: [
        {
          title: "Overview",
          url: "/accounts",
        },
        {
          title: "Connections",
          url: "/connections",
        },
      ],
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: <ArrowRightLeftIcon />,
      items: [
        {
          title: "All transactions",
          url: "/transactions",
        },
        {
          title: "Inbox",
          url: "/transactions/inbox",
        },
      ],
    },
    {
      title: "Categories",
      url: "/categories",
      icon: <BookOpenIcon />,
      items: [
        {
          title: "Manage Categories",
          url: "/categories",
        },
        {
          title: "Rules",
          url: "/categories/rules",
        },
      ],
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: <FunnelIcon />,
    },
    {
      title: "Saving Goals",
      url: "/saving-goals",
      icon: <TargetIcon />,
    },
    {
      title: "Subscriptions",
      url: "/subscriptions",
      icon: <Repeat2Icon />,
    },
    {
      title: "Reports",
      url: "/reports",
      icon: <ChartLineIcon />,
      items: [
        {
          title: "Cashflow",
          url: "/reports/cashflow",
        },
      ],
    },
    {
      title: "Tools",
      url: "/",
      icon: <WrenchIcon />,
      items: [
        {
          title: "Pensions",
          url: "/",
        },
        {
          title: "Investments",
          url: "/",
        },
        {
          title: "Loans",
          url: "/tools/loan",
        },
        {
          title: "Mortgages",
          url: "/tools/mortgage",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
