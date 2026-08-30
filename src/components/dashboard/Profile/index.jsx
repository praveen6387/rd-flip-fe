"use client";

import { CalendarDays, Info, Mail, Phone } from "lucide-react";
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
            : "text-slate-400 hover:text-sky-700"
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

function Field({ label, value, icon: Icon, isDark }) {
  return (
    <div className="group relative min-w-0 px-5 py-5 sm:px-6">
      {Icon ? (
        <Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-5 top-5 size-10 opacity-[0.08] transition duration-500 group-hover:opacity-[0.16]",
            isDark ? "text-white" : "text-sky-800"
          )}
        />
      ) : null}
      <p
        className={cn(
          "text-[10px] font-medium tracking-[0.22em] uppercase",
          isDark ? "text-slate-400" : "text-slate-500"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-[15px] font-medium tracking-tight wrap-break-word",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function CreditStat({ label, value, hint, isDark }) {
  return (
    <div className="min-w-0 px-1 py-1 sm:px-4">
      <div className="flex items-center gap-1.5">
        <p
          className={cn(
            "text-[10px] font-medium tracking-[0.18em] uppercase",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {label}
        </p>
        {hint ? <InfoHint label={label} hint={hint} isDark={isDark} /> : null}
      </div>
      <p
        className={cn(
          "font-heading mt-2 text-2xl tracking-tight sm:text-[1.65rem]",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SectionRule({ isDark }) {
  return (
    <div
      aria-hidden
      className={cn(
        "h-px bg-linear-to-r from-transparent to-transparent",
        isDark ? "via-white/15" : "via-stone-300/70"
      )}
    />
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
              : "border-rose-200/80 bg-rose-50/80 text-rose-700"
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
      lead={
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.6rem] border px-5 py-5 sm:px-6",
            isDark
              ? "border-white/12 bg-white/[0.06]"
              : "border-white/50 bg-white/25"
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 top-1/2 size-40 -translate-y-1/2 rounded-full bg-sky-400/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="relative flex size-[4.25rem] shrink-0 items-center justify-center rounded-[1.35rem] bg-linear-to-br from-sky-500 via-sky-600 to-rose-500 font-heading text-2xl text-white shadow-[0_16px_40px_-18px_rgba(14,165,233,0.7)]">
                {initials}
              </span>
              <div>
                <p
                  className={cn(
                    "font-heading text-xl tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {user.studio_name || "Studio"}
                </p>
                <p
                  className={cn(
                    "mt-1 text-[11px] tracking-[0.22em] uppercase",
                    isDark ? "text-sky-200/80" : "text-sky-800/70"
                  )}
                >
                  {user.plan || "studio"} plan
                </p>
              </div>
            </div>
            <p
              className={cn(
                "max-w-xs text-sm leading-6 sm:text-right",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              This identity appears on the flipbooks you share with clients.
            </p>
          </div>
        </div>
      }
    >
      <div className="dash-stagger space-y-8">
        <section>
          <div className="mb-4">
            <h3
              className={cn(
                "font-heading text-lg tracking-tight",
                isDark ? "text-slate-100" : "text-slate-900"
              )}
            >
              Personal details
            </h3>
            <p
              className={cn(
                "mt-1 text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              How clients and your studio can reach you.
            </p>
          </div>
          <div
            className={cn(
              "grid overflow-hidden rounded-[1.6rem] border sm:grid-cols-2",
              isDark
                ? "divide-y divide-white/10 border-white/12 bg-white/[0.04] sm:divide-x sm:divide-y-0"
                : "divide-y divide-white/50 border-white/45 bg-white/20 sm:divide-x sm:divide-y-0"
            )}
          >
            <Field
              label="Email"
              value={user.email}
              icon={Mail}
              isDark={isDark}
            />
            <Field
              label="Phone"
              value={user.phone}
              icon={Phone}
              isDark={isDark}
            />
            <div className="sm:col-span-2">
              <Field
                label="Date of birth"
                value={formatDate(user.dob)}
                icon={CalendarDays}
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        <SectionRule isDark={isDark} />

        <section>
          <div className="mb-4">
            <h3
              className={cn(
                "font-heading text-lg tracking-tight",
                isDark ? "text-slate-100" : "text-slate-900"
              )}
            >
              Studio
            </h3>
            <p
              className={cn(
                "mt-1 text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              Your brand identity on flipbooks.
            </p>
          </div>
          <div
            className={cn(
              "grid overflow-hidden rounded-[1.6rem] border sm:grid-cols-2",
              isDark
                ? "divide-y divide-white/10 border-white/12 bg-white/[0.04] sm:divide-x sm:divide-y-0"
                : "divide-y divide-white/50 border-white/45 bg-white/20 sm:divide-x sm:divide-y-0"
            )}
          >
            <Field label="Studio name" value={user.studio_name} isDark={isDark} />
            <Field label="Plan" value={user.plan} isDark={isDark} />
          </div>
        </section>

        <SectionRule isDark={isDark} />

        <SocialLinks user={user} isDark={isDark} />

        <SectionRule isDark={isDark} />

        <section>
          <div className="mb-4">
            <h3
              className={cn(
                "font-heading text-lg tracking-tight",
                isDark ? "text-slate-100" : "text-slate-900"
              )}
            >
              Credits
            </h3>
            <p
              className={cn(
                "mt-1 text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              Track what you can still use for flipbooks.
            </p>
          </div>
          <div
            className={cn(
              "grid grid-cols-2 gap-y-6 rounded-[1.6rem] border px-4 py-5 sm:grid-cols-3 lg:grid-cols-5 sm:px-3 sm:py-6",
              isDark
                ? "border-white/12 bg-white/[0.04]"
                : "border-white/45 bg-white/20"
            )}
          >
            <CreditStat
              label="Left"
              value={String(user.left_credit ?? 0)}
              hint="Unused credits you can still spend on flipbooks."
              isDark={isDark}
            />
            <CreditStat
              label="Total"
              value={String(user.total_credit ?? 0)}
              hint="All credits you have received so far."
              isDark={isDark}
            />
            <CreditStat
              label="Used"
              value={String(user.used_credit ?? 0)}
              hint="Credits already used to create flipbooks."
              isDark={isDark}
            />
            <CreditStat
              label="Expired"
              value={String(user.expired_credit ?? 0)}
              hint="Credits that expired before they were used."
              isDark={isDark}
            />
            <CreditStat
              label="Expires"
              value={formatDate(user.credit_expire_date)}
              hint="Date when your remaining credits will expire."
              isDark={isDark}
            />
          </div>
        </section>
      </div>
    </PagePanel>
  );
}
