"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/cn";

const SHEETS = {
  credits: {
    title: "Credit transactions",
    description: "Credit adds, usage, expiry, and adjustments.",
    empty: "No credit transactions yet.",
  },
  orders: {
    title: "Orders",
    description: "Plan orders placed by this user.",
    empty: "No orders yet.",
  },
  plans: {
    title: "Plans",
    description: "Plan history for this user.",
    empty: "No plan history yet.",
  },
  payments: {
    title: "Payments",
    description: "Payment transactions for this user’s orders.",
    empty: "No payments yet.",
  },
};

function userName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User";
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAmount(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCredits(value) {
  const credits = Number(value);
  if (Number.isNaN(credits)) return "—";
  return credits > 0 ? `+${credits}` : String(credits);
}

function tableClasses(isDark) {
  const cellBorder = isDark ? "border-white/10" : "border-stone-200/80";
  return {
    wrap: cn(
      "overflow-x-auto rounded-xl border",
      isDark
        ? "border-white/10 bg-[#141b24]/96"
        : "border-[#e4d9c8]/80 bg-[#fffcf8]/90"
    ),
    head: cn(
      "border-b px-3 py-2.5 text-left text-[11px] font-semibold tracking-[0.14em] uppercase whitespace-nowrap",
      cellBorder,
      isDark ? "bg-white/5 text-slate-400" : "bg-[#fffcf8]/90 text-slate-500"
    ),
    cell: cn(
      "border-b px-3 py-3 text-sm align-top",
      cellBorder,
      isDark ? "text-slate-200" : "text-slate-800"
    ),
    muted: isDark ? "text-slate-400" : "text-slate-500",
    strong: isDark ? "text-white" : "text-slate-900",
  };
}

function DataTable({ columns, rows, isDark, empty, rowKey }) {
  const ui = tableClasses(isDark);

  return (
    <div className={ui.wrap}>
      <table className="w-full min-w-[720px] border-collapse">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key}
                className={cn(ui.head, index < columns.length - 1 && "border-r")}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className={cn("px-4 py-10 text-center text-sm", ui.muted)}
              >
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                className={cn(
                  "last:[&>td]:border-b-0",
                  isDark ? "hover:bg-white/4" : "hover:bg-white/50"
                )}
              >
                {columns.map((column, index) => (
                  <td
                    key={column.key}
                    className={cn(
                      ui.cell,
                      index < columns.length - 1 && "border-r",
                      column.className
                    )}
                  >
                    {column.render(row, ui, isDark)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const CREDIT_COLUMNS = [
  {
    key: "type",
    label: "Type",
    render: (item, ui) => (
      <span className={cn("font-medium capitalize", ui.strong)}>
        {item.credit_type || "—"}
      </span>
    ),
  },
  {
    key: "credits",
    label: "Credits",
    render: (item, ui, isDark) => {
      const credits = Number(item.credits);
      const added = credits > 0;
      return (
        <span
          className={cn(
            "font-semibold tabular-nums",
            added
              ? isDark
                ? "text-emerald-300"
                : "text-emerald-700"
              : isDark
                ? "text-rose-300"
                : "text-rose-700"
          )}
        >
          {formatCredits(item.credits)}
        </span>
      );
    },
  },
  {
    key: "description",
    label: "Description",
    render: (item, ui) => (
      <span className={ui.muted}>{item.description || "—"}</span>
    ),
  },
  {
    key: "flipbook",
    label: "Flipbook",
    render: (item, ui) => item.flipbook_title || <span className={ui.muted}>—</span>,
  },
  {
    key: "order",
    label: "Order",
    render: (item, ui) => item.order_name || <span className={ui.muted}>—</span>,
  },
  {
    key: "date",
    label: "Date",
    className: "whitespace-nowrap",
    render: (item) => formatDateTime(item.created_at),
  },
];

const ORDER_COLUMNS = [
  {
    key: "order",
    label: "Order",
    render: (item, ui) => (
      <span className={cn("font-medium", ui.strong)}>
        {item.order_name || "—"}
      </span>
    ),
  },
  {
    key: "plan",
    label: "Plan",
    render: (item) => item.plan_name || "—",
  },
  {
    key: "amount",
    label: "Amount",
    render: (item, ui) => (
      <span className={cn("font-semibold tabular-nums", ui.strong)}>
        {formatAmount(item.amount)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <span className="capitalize">{item.payment_status || "—"}</span>
    ),
  },
  {
    key: "date",
    label: "Date",
    className: "whitespace-nowrap",
    render: (item) => formatDateTime(item.created_at),
  },
];

const PLAN_COLUMNS = [
  {
    key: "plan",
    label: "Plan",
    render: (item, ui) => (
      <span className={cn("font-medium", ui.strong)}>
        {item.plan_name || "—"}
      </span>
    ),
  },
  {
    key: "type",
    label: "Type",
    render: (item) => (
      <span className="capitalize">{item.plan_type || "—"}</span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <span className="capitalize">{item.status || "—"}</span>
    ),
  },
  {
    key: "credits",
    label: "Credits",
    render: (item) =>
      item.plan_credit != null ? String(item.plan_credit) : "—",
  },
  {
    key: "price",
    label: "Price",
    render: (item, ui) => (
      <span className={cn("font-semibold tabular-nums", ui.strong)}>
        {formatAmount(item.plan_price)}
      </span>
    ),
  },
  {
    key: "start",
    label: "Start",
    className: "whitespace-nowrap",
    render: (item) => formatDateTime(item.start_date),
  },
  {
    key: "expiry",
    label: "Expiry",
    className: "whitespace-nowrap",
    render: (item) => formatDateTime(item.expiry_date),
  },
];

const PAYMENT_COLUMNS = [
  {
    key: "id",
    label: "Payment ID",
    render: (item, ui) => (
      <span className={cn("font-medium break-all", ui.strong)}>
        {item.gateway_payment_id || "—"}
      </span>
    ),
  },
  {
    key: "order",
    label: "Order",
    render: (item) => item.order_name || "—",
  },
  {
    key: "amount",
    label: "Amount",
    render: (item, ui) => (
      <span className={cn("font-semibold tabular-nums", ui.strong)}>
        {formatAmount(item.amount)}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (item) => (
      <span className="capitalize">{item.payment_status || "—"}</span>
    ),
  },
  {
    key: "method",
    label: "Method",
    render: (item, ui) => item.payment_method || <span className={ui.muted}>—</span>,
  },
  {
    key: "date",
    label: "Date",
    className: "whitespace-nowrap",
    render: (item) => formatDateTime(item.created_at),
  },
];

function tableFor(sheet) {
  if (sheet === "orders") {
    return {
      columns: ORDER_COLUMNS,
      rows: (user) => user?.orders || [],
      rowKey: (item) => item.id ?? item.order_name,
    };
  }
  if (sheet === "plans") {
    return {
      columns: PLAN_COLUMNS,
      rows: (user) => user?.user_plans || [],
      rowKey: (item) => item.id,
    };
  }
  if (sheet === "payments") {
    return {
      columns: PAYMENT_COLUMNS,
      rows: (user) => user?.payments || [],
      rowKey: (item) => item.id ?? item.gateway_payment_id,
    };
  }
  return {
    columns: CREDIT_COLUMNS,
    rows: (user) => user?.credit_transactions || [],
    rowKey: (item) => item.id,
  };
}

export default function UserHistorySheet({ user, sheet, onClose, isDark }) {
  const open = Boolean(user && sheet);
  const meta = SHEETS[sheet] || SHEETS.credits;
  const table = tableFor(sheet);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <SheetContent
        side="right"
        className={cn(
          "w-full gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-4xl",
          isDark
            ? "border-white/10 bg-[#121820] text-slate-100"
            : "border-[#e4d9c8]/80 bg-[#fbf8f3] text-slate-900"
        )}
      >
        <SheetHeader
          className={cn(
            "border-b px-5 py-4",
            isDark ? "border-white/10" : "border-stone-200/80"
          )}
        >
          <SheetTitle className={isDark ? "text-white" : "text-slate-900"}>
            {meta.title}
          </SheetTitle>
          <SheetDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
            {userName(user)}
            {user?.email ? ` · ${user.email}` : ""}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          <DataTable
            columns={table.columns}
            rows={table.rows(user)}
            rowKey={table.rowKey}
            empty={meta.empty}
            isDark={isDark}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
