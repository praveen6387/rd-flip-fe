import { LayoutDashboard } from "lucide-react";
import { ROUTES } from "@/lib/routes";

/** Add future dashboard tabs here — used by desktop + mobile sidenav. */
export const DASHBOARD_NAV_ITEMS = [
  {
    label: "Overview",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
];

export function isDashboardNavActive(pathname, href) {
  if (href === ROUTES.dashboard) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
