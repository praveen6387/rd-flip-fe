"use client";

import { Info, Mail, Phone, Sparkles } from "lucide-react";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import SocialLinks from "./_builder/SocialLinks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(user) {
  const first = user?.first_name?.[0] ?? "";
  const last = user?.last_name?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "U";
}

function InfoHint({ label, hint, isDark }) {
  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          "inline-flex size-4 items-center justify-center rounded-full",
          isDark
            ? "text-slate-400 hover:text-sky-300"
            : "text-slate-400 hover:text-sky-600"
        )}
        aria-label={`About ${label}`}
      >
        <Info className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className="max-w-56 text-left">
        {hint}
      </TooltipContent>
    </Tooltip>
  );
}

function DetailCard({ label, value, icon: Icon, isDark, className }) {
  return (
    <div
      className={cn(
        "group rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md",
        isDark
          ? "border-white/15 bg-white/10 hover:border-sky-400/30 hover:bg-white/14"
          : "border-stone-200/80 bg-white/75 hover:border-sky-200 hover:bg-white",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[11px] font-medium tracking-[0.16em] uppercase",
              isDark ? "text-slate-400" : "text-slate-500"
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              "mt-2 text-sm font-semibold wrap-break-word",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {value || "—"}
          </p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl",
              isDark
                ? "bg-white/10 text-sky-200"
                : "bg-linear-to-br from-sky-50 to-indigo-50 text-sky-600"
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
    </div>
  );
}

function CreditStat({ label, value, hint, accent, isDark, className }) {
  const accents = {
    sky: isDark
      ? "from-sky-500/20 to-sky-500/5 ring-sky-400/20"
      : "from-sky-100 to-sky-50 ring-sky-200/80",
    rose: isDark
      ? "from-rose-500/20 to-rose-500/5 ring-rose-400/20"
      : "from-rose-100 to-rose-50 ring-rose-200/80",
    amber: isDark
      ? "from-amber-500/20 to-amber-500/5 ring-amber-400/20"
      : "from-amber-100 to-amber-50 ring-amber-200/80",
    slate: isDark
      ? "from-white/10 to-white/5 ring-white/15"
      : "from-stone-100 to-stone-50 ring-stone-200/80",
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-linear-to-br p-4 ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-md",
        accents[accent],
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <p
          className={cn(
            "text-[11px] font-medium tracking-[0.16em] uppercase",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {label}
        </p>
        {hint ? <InfoHint label={label} hint={hint} isDark={isDark} /> : null}
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-tight",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SectionBlock({ title, subtitle, children, isDark }) {
  return (
    <section className="space-y-3">
      <div>
        <h3
          className={cn(
            "text-sm font-semibold tracking-tight",
            isDark ? "text-slate-100" : "text-slate-800"
          )}
        >
          {title}
        </h3>
        {subtitle ? (
          <p
            className={cn(
              "mt-0.5 text-xs",
              isDark ? "text-slate-400" : "text-slate-500"
            )}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function Profile({ user, error }) {
  const { isDark } = useDashboardTheme();

  if (error || !user) {
    return (
      <PagePanel
        eyebrow="Account"
        title="Profile"
        description="We couldn't load your profile right now."
      >
        <div
          className={cn(
            "rounded-2xl border px-5 py-8 text-center text-sm",
            isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200 bg-rose-50 text-rose-700"
          )}
        >
          {error || "Profile unavailable"}
        </div>
      </PagePanel>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
  const initials = getInitials(user);

  return (
    <PagePanel
      eyebrow="Account"
      title={fullName}
      description="Your studio profile, social presence, and credits."
    >
      <div className="space-y-7">
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border p-5 sm:p-6",
            isDark
              ? "border-white/15 bg-linear-to-br from-sky-500/15 via-white/5 to-rose-500/10"
              : "border-white/80 bg-linear-to-br from-sky-50 via-white to-rose-50"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-sky-400/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-rose-500 text-lg font-bold text-white shadow-lg shadow-sky-500/25">
                {initials}
              </span>
              <div>
                <p
                  className={cn(
                    "text-lg font-semibold tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {fullName}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-sm",
                    isDark ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {user.studio_name || "Studio"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize",
                isDark
                  ? "bg-white/10 text-sky-200 ring-1 ring-white/15"
                  : "bg-white text-sky-700 ring-1 ring-sky-200 shadow-sm"
              )}
            >
              <Sparkles className="size-3.5" />
              {user.plan || "studio"} plan
            </span>
          </div>
        </div>

        <SectionBlock
          title="Personal details"
          subtitle="How clients and your studio can reach you."
          isDark={isDark}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard
              label="Email"
              value={user.email}
              icon={Mail}
              isDark={isDark}
            />
            <DetailCard
              label="Phone"
              value={user.phone}
              icon={Phone}
              isDark={isDark}
            />
            <DetailCard
              label="Date of birth"
              value={formatDate(user.dob)}
              isDark={isDark}
              className="sm:col-span-2"
            />
          </div>
        </SectionBlock>

        <SectionBlock
          title="Studio"
          subtitle="Your brand identity on flipbooks."
          isDark={isDark}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailCard
              label="Studio name"
              value={user.studio_name}
              isDark={isDark}
            />
            <DetailCard label="Plan" value={user.plan} isDark={isDark} />
          </div>
        </SectionBlock>

        <SocialLinks user={user} isDark={isDark} />

        <SectionBlock
          title="Credits"
          subtitle="Track what you can still use for flipbooks."
          isDark={isDark}
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CreditStat
              label="Credits left"
              value={String(user.left_credit ?? 0)}
              hint="Unused credits you can still spend on flipbooks."
              accent="sky"
              isDark={isDark}
            />
            <CreditStat
              label="Total credits"
              value={String(user.total_credit ?? 0)}
              hint="All credits you have received so far."
              accent="slate"
              isDark={isDark}
            />
            <CreditStat
              label="Used credits"
              value={String(user.used_credit ?? 0)}
              hint="Credits already used to create flipbooks."
              accent="amber"
              isDark={isDark}
            />
            <CreditStat
              label="Expired credits"
              value={String(user.expired_credit ?? 0)}
              hint="Credits that expired before they were used."
              accent="rose"
              isDark={isDark}
            />
            <CreditStat
              label="Credit expires"
              value={formatDate(user.credit_expire_date)}
              hint="Date when your remaining credits will expire."
              accent="slate"
              isDark={isDark}
              className="sm:col-span-2 lg:col-span-1"
            />
          </div>
        </SectionBlock>
      </div>
    </PagePanel>
  );
}
