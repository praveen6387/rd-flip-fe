const KEY = "rd-flip-selection-grant";

export function grantedSelection() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (!value || typeof value.token !== "string" || typeof value.code !== "string") return null;
    return value;
  } catch {
    return null;
  }
}

export function grantSelection(token, code) {
  sessionStorage.setItem(KEY, JSON.stringify({ token, code }));
}
