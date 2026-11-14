export function clientSelectBlock({ rules, selectedCount, extraAllowed }) {
  const mode = rules?.rulesConfigured === false ? "UNLIMITED" : (rules?.selectionMode || "UNLIMITED");
  if (mode === "FIXED") {
    const target = Number(rules?.requiredPhotos || 0);
    if (target && selectedCount >= target) {
      const sheets = Math.ceil(target / Math.max(1, Number(rules?.photosPerSheet || 4)));
      return { type: "limit", message: `Fixed target of ${target} photos (${sheets} sheets) reached. To select a new photo, please deselect one first.` };
    }
  }
  if (mode === "MIN_EXTRA") {
    const included = Number(rules?.includedPhotos || 0);
    if (included && selectedCount >= included) {
      if (rules?.allowExtraPhotos === false) {
        return { type: "limit", message: `Extra photos are disabled for this gallery. Selection limit is ${included} photos.` };
      }
      if (!extraAllowed) return { type: "extra" };
    }
  }
  return null;
}

export function selectionQuote(rules, selectedCount, totalCount = 0) {
  const mode = rules?.rulesConfigured === false ? "UNLIMITED" : (rules?.selectionMode || "UNLIMITED");
  const perSheet = Math.max(1, Number(rules?.photosPerSheet || 4));
  const required = Number(rules?.requiredPhotos || 0);
  const included = Number(rules?.includedPhotos || 0);
  const target = totalCount > 0 && required ? Math.min(required, totalCount) : required;
  const minimum = totalCount > 0 && included ? Math.min(included, totalCount) : included;
  const estimatedSheets = selectedCount > 0 ? Math.ceil(selectedCount / perSheet) : 0;
  if (mode === "FIXED") {
    return { mode, estimatedSheets, remaining: target - selectedCount, extraPhotos: 0, extraSheets: 0, totalExtraCharge: 0, includedSheets: target ? Math.ceil(target / perSheet) : 0 };
  }
  if (mode === "MIN_EXTRA") {
    const extraPhotos = Math.max(0, selectedCount - minimum);
    const includedSheets = minimum ? Math.ceil(minimum / perSheet) : 0;
    const extraSheets = Math.max(0, estimatedSheets - includedSheets);
    const photoCharge = rules?.enableExtraPhotoPricing ? extraPhotos * Number(rules.extraPhotoPrice || 0) : 0;
    const sheetCharge = rules?.enableExtraSheetPricing ? extraSheets * Number(rules.extraSheetPrice || 0) : 0;
    return { mode, estimatedSheets, remaining: Math.max(0, minimum - selectedCount), extraPhotos, extraSheets, includedSheets, totalExtraCharge: photoCharge + sheetCharge };
  }
  return { mode, estimatedSheets, remaining: selectedCount > 0 ? 0 : 1, extraPhotos: 0, extraSheets: 0, totalExtraCharge: 0, includedSheets: 0 };
}

export function selectionRuleText(rules) {
  if (!rules || rules.selectionMode === "UNLIMITED") return "Unlimited selection. Choose at least one photo, then confirm.";
  if (rules.selectionMode === "FIXED") return `Fixed selection. Confirm only when exactly ${rules.requiredPhotos} photos are selected.`;
  const extra = rules.allowExtraPhotos === false ? " Extra photos are turned off." : " Extra photos need a confirmation before they are added.";
  return `Select at least ${rules.includedPhotos} photos.${extra}`;
}
