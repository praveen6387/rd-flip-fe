/** Date-only compare: valid through the expire day (inclusive). */
export function isCreditExpired(creditExpireDate) {
  if (!creditExpireDate) return false;

  const expire = new Date(creditExpireDate);
  if (Number.isNaN(expire.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expire.setHours(0, 0, 0, 0);

  return expire < today;
}

const PRODUCT_SHORT = {
  flipbook: "flipbook",
  photo_selection: "selection",
  all: "all",
};

function normalizeBalance(balance) {
  return {
    product: balance?.product || "signup",
    label: balance?.label || "Credits",
    plan_name: balance?.plan_name || "",
    plan_type: balance?.plan_type || "",
    features: Array.isArray(balance?.features) ? balance.features : [],
    credits_left: Number(balance?.credits_left) || 0,
    credits_used: Number(balance?.credits_used) || 0,
    credits_expired: Number(balance?.credits_expired) || 0,
    credits_total: Number(balance?.credits_total) || 0,
    expiry_date: balance?.expiry_date || null,
  };
}

/** One entry per active plan, including the free Welcome plan. */
export function getCreditBalances(user) {
  if (!Array.isArray(user?.active_balances)) return [];
  return user.active_balances.map(normalizeBalance);
}

/** Flipbook creation can use a Flipbook plan, an All plan, or signup credits. */
export function getFlipbookBalances(user) {
  return getCreditBalances(user).filter(
    (balance) =>
      balance.product === "flipbook" ||
      balance.product === "all" ||
      balance.product === "signup"
  );
}

/** Studio or lab for a new flipbook. Photo Selection does not decide this. */
export function getFlipbookPlanType(user) {
  const balances = getFlipbookBalances(user);
  const specific = balances.find((balance) => balance.product === "flipbook");
  const shared = balances.find((balance) => balance.product === "all");
  const signup = balances.find((balance) => balance.product === "signup");
  return (specific || shared || signup)?.plan_type || user?.plan || "studio";
}

export function getFlipbookCredit(user) {
  return getFlipbookBalances(user).reduce(
    (sum, balance) => sum + balance.credits_left,
    0
  );
}

export function hasFlipbookCredit(user) {
  return getFlipbookBalances(user).some(
    (balance) =>
      balance.credits_left >= 1 && !isCreditExpired(balance.expiry_date)
  );
}

/** Usable only when a flipbook can still be created. */
export function hasUsableCredit(user) {
  return hasFlipbookCredit(user);
}

export function hasDisplayedCredit(user) {
  return getCreditBalances(user).some(
    (balance) =>
      balance.credits_left >= 1 && !isCreditExpired(balance.expiry_date)
  );
}

/** Header: "5 credits left", or "5 flipbook · 6 selection". */
export function formatCreditSummary(user) {
  const balances = getCreditBalances(user);
  if (!balances.length) return "0 credits left";
  if (balances.length === 1 && balances[0].product === "signup") {
    const balance = balances[0];
    if (isCreditExpired(balance.expiry_date)) return "Credits expired";
    const left = balance.credits_left;
    return `${left} ${left === 1 ? "credit" : "credits"} left`;
  }

  return balances
    .map((balance) => {
      const name = PRODUCT_SHORT[balance.product] || balance.label.toLowerCase();
      return `${balance.credits_left} ${name}`;
    })
    .join(" · ");
}

export function formatCreditExpireDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function hasPhotoSelectionCredit(user) {
  return getCreditBalances(user).some(balance => ["photo_selection", "all"].includes(balance.product) && balance.credits_left >= 1 && !isCreditExpired(balance.expiry_date));
}
