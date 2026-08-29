import { BookOpen, PlusCircle, UserRound } from "lucide-react";
import { ROUTES } from "@/lib/routes";

/** Add future dashboard tabs here — used by desktop + mobile sidenav. */
export const DASHBOARD_NAV_ITEMS = [
  {
    label: "Profile",
    href: ROUTES.dashboard,
    icon: UserRound,
  },
  {
    label: "Flipbook",
    href: ROUTES.dashboardFlipbook,
    icon: BookOpen,
  },
  {
    label: "Create Flipbook",
    href: ROUTES.dashboardCreateFlipbook,
    icon: PlusCircle,
  },
];

export function isDashboardNavActive(pathname, href) {
  if (href === ROUTES.dashboard) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
