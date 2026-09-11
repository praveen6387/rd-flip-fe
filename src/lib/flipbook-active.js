/** True when active_until is set and already in the past. null = no fixed expiry. */
export function isFlipbookExpired(activeUntil) {
  if (!activeUntil) return false;
  const until = new Date(activeUntil);
  if (Number.isNaN(until.getTime())) return false;
  return until.getTime() < Date.now();
}

export function formatActiveUntil(activeUntil) {
  if (!activeUntil) return null;
  const date = new Date(activeUntil);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDaysUntilActive(activeUntil) {
  if (!activeUntil) return null;
  const until = new Date(activeUntil);
  if (Number.isNaN(until.getTime())) return null;
  const ms = until.getTime() - Date.now();
  if (ms < 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/**
 * Listing / UI helper for active_until.
 * - null: unlimited (no badge)
 * - future: show expiry + days left + recharge hint
 * - past: expired + recharge hint
 */
export function getFlipbookActiveInfo(activeUntil) {
  if (!activeUntil) {
    return {
      hasExpiry: false,
      expired: false,
      dateLabel: null,
      daysLeft: null,
      statusLabel: null,
      hint: null,
    };
  }

  const dateLabel = formatActiveUntil(activeUntil);
  const expired = isFlipbookExpired(activeUntil);

  if (expired) {
    return {
      hasExpiry: true,
      expired: true,
      dateLabel,
      daysLeft: 0,
      statusLabel: dateLabel ? `Expired on ${dateLabel}` : "Expired",
      hint: "Recharge to restore View & QR access.",
    };
  }

  const daysLeft = getDaysUntilActive(activeUntil);
  const daysText =
    daysLeft === null
      ? null
      : daysLeft <= 0
        ? "Expires today"
        : daysLeft === 1
          ? "1 day left"
          : `${daysLeft} days left`;

  return {
    hasExpiry: true,
    expired: false,
    dateLabel,
    daysLeft,
    statusLabel: [dateLabel ? `Active until ${dateLabel}` : null, daysText]
      .filter(Boolean)
      .join(" · "),
    hint: "Recharge before this date to keep the flipbook live.",
  };
}
