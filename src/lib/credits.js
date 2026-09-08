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

export function getLeftCredit(user) {
  return Number(user?.left_credit) || 0;
}

/** Usable only when count > 0 and not past credit_expire_date. */
export function hasUsableCredit(user) {
  return getLeftCredit(user) >= 1 && !isCreditExpired(user?.credit_expire_date);
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
