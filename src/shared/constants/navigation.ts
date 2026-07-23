export interface AppNavItem {
  href: string;
  label: string;
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/tracks", label: "Tracks" },
  { href: "/artists", label: "Artists" },
  { href: "/recent", label: "Recent" },
  { href: "/settings", label: "Settings" },
];
