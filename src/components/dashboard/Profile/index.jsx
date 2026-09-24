"use client";

import { CalendarDays, Info, Mail, Phone } from "lucide-react";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import ChangePassword from "./_builder/ChangePassword";
import SocialLinks from "./_builder/SocialLinks";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

const cardSurface = (isDark) =>
  isDark
    ? "border-white/10 bg-[#141b24]/96 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.7)]"
    : "border-[#e4d9c8]/80 bg-[#fffcf8]/92 shadow-[0_18px_40px_-28px_rgba(120,90,50,0.2)]";

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
          "inline-flex size-5 items-center justify-center rounded-full",
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
    <div className="group relative min-w-0 px-5 py-5 sm:px-6 sm:py-6">
      {Icon ? (
        <Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-5 top-5 size-11 opacity-[0.1] transition duration-500 group-hover:opacity-[0.18]",
            isDark ? "text-white" : "text-sky-800"
          )}
        />
      ) : null}
      <p
        className={cn(
          "text-xs font-semibold tracking-[0.16em] uppercase",
          isDark ? "text-slate-400" : "text-slate-500"
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2.5 text-base font-semibold tracking-tight wrap-break-word sm:text-[1.05rem]",
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
            "text-xs font-semibold tracking-[0.14em] uppercase",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {label}
        </p>
        {hint ? <InfoHint label={label} hint={hint} isDark={isDark} /> : null}
      </div>
      <p
        className={cn(
          "font-heading mt-2.5 text-[1.75rem] tracking-tight sm:text-[1.85rem]",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, description, isDark }) {
  return (
    <div className="mb-4">
      <h3
        className={cn(
          "font-heading text-xl tracking-tight sm:text-[1.35rem]",
          isDark ? "text-slate-100" : "text-slate-900"
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          className={cn(
            "mt-1.5 text-[15px] leading-6",
            isDark ? "text-slate-400" : "text-slate-600"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
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
            "rounded-2xl border px-5 py-8 text-center text-[15px]",
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
      description="Your studio profile, password, social presence, and credits."
      lead={
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.6rem] border px-5 py-6 sm:px-7 sm:py-7",
            cardSurface(isDark)
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 top-1/2 size-44 -translate-y-1/2 rounded-full bg-sky-400/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-8 -bottom-10 size-36 rounded-full bg-rose-300/20 blur-3xl"
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="relative flex size-[4.5rem] shrink-0 items-center justify-center rounded-[1.4rem] bg-linear-to-br from-sky-500 via-sky-600 to-rose-500 font-heading text-[1.7rem] text-white shadow-[0_16px_40px_-18px_rgba(14,165,233,0.7)]">
                {initials}
              </span>
              <div>
                <p
                  className={cn(
                    "font-heading text-[1.35rem] tracking-tight sm:text-2xl",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {user.studio_name || "Studio"}
                </p>
                <p
                  className={cn(
                    "mt-1.5 text-xs font-semibold tracking-[0.18em] uppercase",
                    isDark ? "text-sky-200/90" : "text-sky-700"
                  )}
                >
                  {user.plan || "studio"} plan
                </p>
              </div>
            </div>
            <p
              className={cn(
                "max-w-xs text-[15px] leading-7 sm:text-right",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              This identity appears on the flipbooks you share with clients.
            </p>
          </div>
        </div>
      }
    >
      <div className="dash-stagger space-y-9">
        <section>
          <SectionHeader
            title="Personal details"
            description="How clients and your studio can reach you."
            isDark={isDark}
          />
          <div
            className={cn(
              "grid overflow-hidden rounded-[1.6rem] border sm:grid-cols-2",
              isDark
                ? "divide-y divide-white/10 border-white/10 bg-[#141b24]/96 sm:divide-x sm:divide-y-0"
                : "divide-y divide-[#ebe3d6] border-[#e4d9c8]/80 bg-[#fffcf8]/92 sm:divide-x sm:divide-y-0"
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

        <section>
          <SectionHeader
            title="Studio"
            description="Your brand identity on flipbooks."
            isDark={isDark}
          />
          <div
            className={cn(
              "grid overflow-hidden rounded-[1.6rem] border sm:grid-cols-2",
              isDark
                ? "divide-y divide-white/10 border-white/10 bg-[#141b24]/96 sm:divide-x sm:divide-y-0"
                : "divide-y divide-[#ebe3d6] border-[#e4d9c8]/80 bg-[#fffcf8]/92 sm:divide-x sm:divide-y-0"
            )}
          >
            <Field label="Studio name" value={user.studio_name} isDark={isDark} />
            <Field label="Plan" value={user.plan} isDark={isDark} />
          </div>
        </section>

        <SocialLinks user={user} isDark={isDark} />

        <ChangePassword isDark={isDark} />

        <section>
          <SectionHeader
            title="Credits"
            description="Track what you can still use for flipbooks."
            isDark={isDark}
          />
          <div
            className={cn(
              "grid grid-cols-2 gap-y-6 rounded-[1.6rem] border px-4 py-6 sm:grid-cols-3 lg:grid-cols-5 sm:px-3 sm:py-7",
              cardSurface(isDark)
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
