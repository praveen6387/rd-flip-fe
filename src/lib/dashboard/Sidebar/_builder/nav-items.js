import {
  BookOpen,
  FileText,
  Images,
  PlusCircle,
  Receipt,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
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
  {
    label: "Plans & Credits",
    href: ROUTES.dashboardPlans,
    icon: WalletCards,
  },
  {
    id: "invoices",
    label: "Invoices & Payments",
    icon: FileText,
    locked: true,
  },
  {
    id: "photo-selection",
    label: "Photo Selection",
    icon: Images,
    locked: true,
  },
  {
    label: "Users",
    href: ROUTES.dashboardUsers,
    icon: Users,
    roles: ["admin"],
  },
  {
    label: "Orders",
    href: ROUTES.dashboardOrders,
    icon: Receipt,
    roles: ["admin"],
  },
];

export function getDashboardNavItems(user, { verified = true } = {}) {
  const role = verified ? user?.role : "studio";
  return DASHBOARD_NAV_ITEMS.filter((item) => {
    if (!item.roles?.length) return true;
    return item.roles.includes(role);
  });
}

export function isDashboardNavActive(pathname, href) {
  if (!href) return false;
  if (href === ROUTES.dashboard) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
