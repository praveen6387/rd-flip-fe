"use client";

import { useId } from "react";
import {
  CalendarDays,
  Check,
  Crown,
  Eye,
  Heart,
  Info,
  Layers,
  Mail,
  Phone,
} from "lucide-react";
import { Area, AreaChart, Pie, PieChart } from "recharts";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import SocialLinks from "./_builder/SocialLinks";
import { ChartContainer } from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { PROFILE_IMAGES } from "@/lib/dashboard/images";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth";

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

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

function ContactCard({ label, value, icon: Icon, iconClass, isDark }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-3.5 backdrop-blur-xl",
        isDark ? "border-white/10 bg-white/8" : "border-white/45 bg-white/25"
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          iconClass
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            "text-xs",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-semibold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

const CREDIT_SLICES = [
  { key: "left", label: "Left", color: "#22a06b" },
  { key: "used", label: "Used", color: "#3b82f6" },
  { key: "expired", label: "Expired", color: "#e8922a" },
];

const VIEW_TREND = [
  { value: 12 },
  { value: 20 },
  { value: 14 },
  { value: 28 },
  { value: 18 },
  { value: 34 },
  { value: 26 },
  { value: 42 },
];

const LIKE_TREND = [
  { value: 8 },
  { value: 14 },
  { value: 11 },
  { value: 18 },
  { value: 15 },
  { value: 24 },
  { value: 20 },
  { value: 30 },
];

function AudienceSpark({ color, data }) {
  const gradientId = `audience-spark-${useId().replace(/:/g, "")}`;

  return (
    <ChartContainer
      config={{ value: { label: "Trend", color } }}
      initialDimension={{ width: 180, height: 72 }}
      className="aspect-auto h-18 w-full"
    >
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.38" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function CreditDonut({ left, used, expired, total, isDark }) {
  const values = { left, used, expired };
  const slices = CREDIT_SLICES.filter((slice) => values[slice.key] > 0).map(
    (slice) => ({
      name: slice.label,
      value: values[slice.key],
      fill: slice.color,
    })
  );
  const chartData = slices.length
    ? slices
    : [{ name: "None", value: 1, fill: isDark ? "#334155" : "#e5e7eb" }];

  return (
    <div className="relative size-36 shrink-0">
      <ChartContainer
        config={{
          left: { label: "Left", color: "#22a06b" },
          used: { label: "Used", color: "#3b82f6" },
          expired: { label: "Expired", color: "#e8922a" },
        }}
        initialDimension={{ width: 144, height: 144 }}
        className="aspect-auto size-36"
      >
        <PieChart>
          <Pie
            data={[{ name: "track", value: 1 }]}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius="76%"
            outerRadius="96%"
            fill={isDark ? "#243044" : "#e7edf3"}
            stroke="none"
            isAnimationActive={false}
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="76%"
            outerRadius="96%"
            startAngle={90}
            endAngle={-270}
            cornerRadius={2}
            paddingAngle={slices.length > 1 ? 1.5 : 0}
            stroke="none"
          />
        </PieChart>
      </ChartContainer>
      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
        <div>
          <p
            className={cn(
              "text-[1.65rem] font-bold leading-none tracking-tight",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {left}
            <span
              className={cn(
                "text-sm font-semibold",
                isDark ? "text-slate-500" : "text-slate-400"
              )}
            >
              /{total}
            </span>
          </p>
          <p
            className={cn(
              "mt-1 text-[11px]",
              isDark ? "text-slate-400" : "text-slate-400"
            )}
          >
            Total Credits
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { isDark } = useDashboardTheme();
  const { user } = useAuth();

  if (!user) {
    return (
      <PagePanel>
        <div
          className={cn(
            "rounded-2xl border px-5 py-8 text-center text-[15px]",
            isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200/80 bg-rose-50/80 text-rose-700"
          )}
        >
          Profile unavailable
        </div>
      </PagePanel>
    );
  }

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
  const initials = getInitials(user);
  const planLabel = user.plan || "Studio";
  const left = Number(user.left_credit) || 0;
  const used = Number(user.used_credit) || 0;
  const expired = Number(user.expired_credit) || 0;
  const total = Number(user.total_credit) || 0;

  const panel = cn(
    "rounded-[1.6rem] border p-4 backdrop-blur-xl sm:p-5",
    isDark
      ? "border-white/10 bg-white/8"
      : "border-white/50 bg-white/25 shadow-[0_8px_32px_-24px_rgba(80,90,140,0.4)]"
  );

  return (
    <PagePanel>
      <div className="dash-stagger space-y-4">
        <section
          className={cn(
            "relative overflow-hidden rounded-[1.75rem] border px-4 py-4 backdrop-blur-xl sm:px-5 sm:py-6",
            isDark
              ? "border-white/10 bg-white/8"
              : "border-white/50 bg-white/20"
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat",
              isDark ? "opacity-25" : "opacity-70"
            )}
            style={{ backgroundImage: `url(${PROFILE_IMAGES.hero})` }}
          />
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0",
              isDark ? "bg-[#0c1220]/55" : "bg-white/10"
            )}
          />
          <div className="relative">
            <div className="flex items-center gap-4">
              <span className="grid size-20 shrink-0 place-items-center rounded-full bg-linear-to-br from-sky-400 via-indigo-500 to-fuchsia-500 text-3xl font-semibold text-white shadow-lg shadow-indigo-500/30">
                {initials}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2
                    className={cn(
                      "truncate text-2xl font-semibold tracking-tight",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {fullName}
                  </h2>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                      isDark
                        ? "bg-sky-400/15 text-sky-200"
                        : "bg-sky-500/15 text-sky-700"
                    )}
                  >
                    {planLabel} Plan
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-0 text-sm font-medium",
                    isDark ? "text-slate-300" : "text-slate-700"
                  )}
                >
                  {user.studio_name || "Studio"}
                </p>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-slate-300" : "text-slate-500"
                  )}
                >
                  Your studio profile, social presence, and credits.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <ContactCard
                label="Email"
                value={user.email}
                icon={Mail}
                iconClass="bg-sky-100 text-sky-600"
                isDark={isDark}
              />
              <ContactCard
                label="Phone"
                value={user.phone}
                icon={Phone}
                iconClass="bg-emerald-100 text-emerald-600"
                isDark={isDark}
              />
              <ContactCard
                label="Date of birth"
                value={formatDate(user.dob)}
                icon={CalendarDays}
                iconClass="bg-violet-100 text-violet-600"
                isDark={isDark}
              />
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className={panel}>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-sky-100 text-sky-600">
                <Eye className="size-4" />
              </span>
              <h3
                className={cn(
                  "text-base font-semibold",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Audience
              </h3>
              <InfoHint
                label="Audience"
                hint="Views and likes across your active flipbooks."
                isDark={isDark}
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                {
                  label: "Views",
                  value: formatCount(user.total_view_count),
                  icon: Eye,
                  trend: VIEW_TREND,
                  stroke: "#3b82f6",
                  iconClass: "bg-white text-sky-600",
                  cardClass: isDark
                    ? "border-white/10 bg-sky-400/10 backdrop-blur-md"
                    : "border-white/50 bg-sky-100/25 backdrop-blur-md",
                },
                {
                  label: "Likes",
                  value: formatCount(user.total_like_count),
                  icon: Heart,
                  trend: LIKE_TREND,
                  stroke: "#f43f5e",
                  iconClass: "bg-white text-rose-500",
                  cardClass: isDark
                    ? "border-white/10 bg-rose-400/10 backdrop-blur-md"
                    : "border-white/50 bg-rose-100/25 backdrop-blur-md",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-2xl border",
                      item.cardClass
                    )}
                  >
                    <div className="flex items-center gap-3 px-3 pt-3">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-xl shadow-sm",
                          item.iconClass
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-2xl font-semibold leading-none",
                            isDark ? "text-white" : "text-slate-900"
                          )}
                        >
                          {item.value}
                        </p>
                        <p
                          className={cn(
                            "mt-1 text-xs",
                            isDark ? "text-slate-400" : "text-slate-500"
                          )}
                        >
                          {item.label}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <AudienceSpark color={item.stroke} data={item.trend} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className={panel}>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-2xl shadow-sm",
                  isDark ? "bg-white/10 text-amber-300" : "bg-white text-amber-500"
                )}
              >
                <Layers className="size-5" />
              </span>
              <h3
                className={cn(
                  "text-lg font-semibold tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Credits
              </h3>
            </div>
            <div className="mt-5 flex items-center gap-5">
              <CreditDonut
                left={left}
                used={used}
                expired={expired}
                total={total}
                isDark={isDark}
              />
              <div className="min-w-0 flex-1">
                <ul className="space-y-3 text-sm">
                  {[
                    { ...CREDIT_SLICES[0], value: left },
                    { ...CREDIT_SLICES[1], value: used },
                    { ...CREDIT_SLICES[2], value: expired },
                  ].map((item) => (
                    <li key={item.key} className="flex items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "ml-auto font-semibold tabular-nums",
                          isDark ? "text-white" : "text-slate-900"
                        )}
                      >
                        {item.value}
                      </span>
                    </li>
                  ))}
                </ul>
                <p
                  className={cn(
                    "mt-4 text-sm text-nowrap",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  Expires on{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {formatDate(user.credit_expire_date)}
                  </span>
                </p>
              </div>
            </div>
          </article>

          <article
            className={cn(
              "relative overflow-hidden rounded-[1.6rem] border p-5 backdrop-blur-xl",
              isDark
                ? "border-white/10 bg-white/8"
                : "border-white/50 bg-white/25 shadow-[0_8px_32px_-24px_rgba(80,90,140,0.4)]"
            )}
          >
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-0 bg-cover bg-right-bottom bg-no-repeat",
                isDark ? "opacity-20" : "opacity-45"
              )}
              style={{ backgroundImage: `url(${PROFILE_IMAGES.plan})` }}
            />
            {isDark ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#0c1220]/35"
              />
            ) : null}
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-10 place-items-center rounded-2xl shadow-sm",
                      isDark ? "bg-white/10 text-amber-300" : "bg-white text-amber-500"
                    )}
                  >
                    <Crown className="size-5" />
                  </span>
                  <h3
                    className={cn(
                      "text-lg font-semibold tracking-tight",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    Current Plan
                  </h3>
                </div>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                    isDark
                      ? "bg-sky-400/15 text-sky-200"
                      : "bg-sky-100 text-sky-700"
                  )}
                >
                  {planLabel} Plan
                </span>
              </div>
              <ul className="mt-5 space-y-3.5 pr-28 text-sm pl-2">
                {[
                  "Create flipbooks",
                  "Share with clients",
                  "Basic analytics",
                  "Email support",
                ].map((line) => (
                  <li key={line} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-full",
                        isDark ? "bg-white/10 text-emerald-400" : "bg-[#e8ebf0] text-emerald-500"
                      )}
                    >
                      <Check className="size-3.5" strokeWidth={2.75} />
                    </span>
                    <span className={isDark ? "text-slate-200" : "text-slate-600"}>
                      {line}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        </section>

        <SocialLinks user={user} isDark={isDark} />
      </div>
    </PagePanel>
  );
}
