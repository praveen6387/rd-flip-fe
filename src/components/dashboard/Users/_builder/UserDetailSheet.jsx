"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/cn";

const PRODUCT_LABEL = {
  flipbook: "Flipbook",
  photo_selection: "Photo selection",
  all: "All",
};

function userName(user) {
  return [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

function productLabel(product) {
  return PRODUCT_LABEL[product] || product || "—";
}

function isCurrentPlan(plan) {
  if (plan?.status !== "active") return false;
  const expiry = new Date(plan.expiry_date).getTime();
  return !Number.isNaN(expiry) && expiry > Date.now();
}

function Section({ title, isDark, children }) {
  return (
    <section>
      <h3
        className={cn(
          "text-xs font-semibold tracking-[0.16em] uppercase",
          isDark ? "text-slate-400" : "text-slate-500"
        )}
      >
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Fact({ label, value, isDark }) {
  return (
    <div>
      <p className={cn("text-[11px]", isDark ? "text-slate-400" : "text-slate-500")}>
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm break-all",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function PlanBlock({ plan, isDark }) {
  const left = plan.credits_left ?? Math.max(
    0,
    (Number(plan.credits_total) || 0) - (Number(plan.credits_used) || 0)
  );

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-3",
        isDark
          ? "border-white/12 bg-[#121820]/68 backdrop-blur-xl"
          : "border-white/70 bg-white/62 backdrop-blur-xl"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
            {plan.plan_name || "Plan"}
          </p>
          <p className={cn("mt-0.5 text-xs capitalize", isDark ? "text-slate-400" : "text-slate-500")}>
            {productLabel(plan.plan_product)} · {plan.plan_type || "—"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
            plan.status === "active"
              ? isDark
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-emerald-100 text-emerald-700"
              : isDark
                ? "bg-white/10 text-slate-300"
                : "bg-stone-100 text-slate-600"
          )}
        >
          {plan.status || "—"}
        </span>
      </div>
      <p className={cn("mt-2 text-sm", isDark ? "text-slate-200" : "text-slate-700")}>
        {left} left · {plan.credits_used ?? 0} used · {plan.credits_total ?? 0} total
      </p>
      <p className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
        {formatDate(plan.start_date)} – {formatDate(plan.expiry_date)}
      </p>
    </div>
  );
}

export default function UserDetailSheet({ user, open, onClose, isDark }) {
  const plans = user?.user_plans || [];
  const currentPlans = plans.filter(isCurrentPlan);
  const pastPlans = plans.filter((plan) => !isCurrentPlan(plan));
  const flipbooks = user?.flipbooks || [];
  const credits = user?.credit_transactions || [];

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
          "w-full gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-xl",
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
            {userName(user)}
          </SheetTitle>
          <SheetDescription className={isDark ? "text-slate-400" : "text-slate-600"}>
            {user?.studio_name || "Studio"} · {user?.email || "No email"}
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-6 overflow-auto px-5 py-5">
          <Section title="Account" isDark={isDark}>
            <div className="grid grid-cols-2 gap-3">
              <Fact label="Phone" value={user?.phone} isDark={isDark} />
              <Fact label="Date of birth" value={formatDate(user?.dob)} isDark={isDark} />
              <Fact label="WhatsApp" value={user?.whatsapp_number} isDark={isDark} />
              <Fact label="Role" value={user?.role} isDark={isDark} />
              <Fact label="Instagram" value={user?.instagram_url} isDark={isDark} />
              <Fact label="Facebook" value={user?.facebook_url} isDark={isDark} />
              <Fact label="Joined" value={formatDateTime(user?.created_at)} isDark={isDark} />
              <Fact
                label="Account"
                value={user?.is_active === false ? "Inactive" : "Active"}
                isDark={isDark}
              />
            </div>
          </Section>

          <Section title="Work" isDark={isDark}>
            <div className="grid grid-cols-2 gap-3">
              <Fact
                label="Flipbooks"
                value={String(user?.flipbook_count ?? flipbooks.length)}
                isDark={isDark}
              />
              <Fact
                label="Photo selections"
                value={String(user?.photo_selection_count ?? 0)}
                isDark={isDark}
              />
              <Fact label="Views" value={String(user?.total_view_count ?? 0)} isDark={isDark} />
              <Fact label="Likes" value={String(user?.total_like_count ?? 0)} isDark={isDark} />
            </div>
          </Section>

          <Section title="Current plan" isDark={isDark}>
            {currentPlans.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                No active plan
              </p>
            ) : (
              <div className="space-y-2">
                {currentPlans.map((plan) => (
                  <PlanBlock key={plan.id} plan={plan} isDark={isDark} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Past plans" isDark={isDark}>
            {pastPlans.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                No past plans
              </p>
            ) : (
              <div className="space-y-2">
                {pastPlans.map((plan) => (
                  <PlanBlock key={plan.id} plan={plan} isDark={isDark} />
                ))}
              </div>
            )}
          </Section>

          <Section title="Flipbooks" isDark={isDark}>
            {flipbooks.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                No flipbooks yet
              </p>
            ) : (
              <ul className="space-y-2">
                {flipbooks.map((book) => (
                  <li
                    key={book.id}
                    className={cn(
                      "rounded-xl border px-3 py-2.5",
                      isDark
                        ? "border-white/12 bg-[#121820]/60 backdrop-blur-xl"
                        : "border-white/60 bg-white/50 backdrop-blur-xl"
                    )}
                  >
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                      {book.title || "Untitled"}
                    </p>
                    <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                      {book.flip_id} · {book.total_pages ?? 0} pages · {book.view_count ?? 0} views ·{" "}
                      {book.like_count ?? 0} likes · {formatDate(book.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Credit activity" isDark={isDark}>
            {credits.length === 0 ? (
              <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                No credit activity yet
              </p>
            ) : (
              <ul className="space-y-2">
                {credits.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5",
                      isDark
                        ? "border-white/12 bg-[#121820]/60 backdrop-blur-xl"
                        : "border-white/60 bg-white/50 backdrop-blur-xl"
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn("text-sm capitalize", isDark ? "text-white" : "text-slate-900")}>
                        {item.credit_type || "Credit"}
                        {item.flipbook_title ? ` · ${item.flipbook_title}` : ""}
                        {item.order_name ? ` · ${item.order_name}` : ""}
                      </p>
                      <p className={cn("mt-0.5 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                        {item.description || formatDateTime(item.created_at)}
                      </p>
                    </div>
                    <p className={cn("shrink-0 text-sm font-semibold tabular-nums", isDark ? "text-white" : "text-slate-900")}>
                      {Number(item.credits) > 0 ? `+${item.credits}` : item.credits}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
