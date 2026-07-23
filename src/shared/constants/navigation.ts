import {
  Clock3,
  LayoutDashboard,
  Music2,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/tracks", label: "Tracks", icon: Music2 },
  { href: "/artists", label: "Artists", icon: Users },
  { href: "/recent", label: "Recent", icon: Clock3 },
  { href: "/settings", label: "Settings", icon: Settings },
];
