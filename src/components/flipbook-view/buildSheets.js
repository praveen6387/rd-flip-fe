function coverType(value) {
  const key = String(value || "").toLowerCase();
  if (key === "front" || key === "middle" || key === "back") return key;
  return "middle";
}

function sortPages(pages) {
  return [...(pages || [])].sort(
    (a, b) => (a.page_number || 0) - (b.page_number || 0)
  );
}

/**
 * Book sheets from API pages only:
 * Front → full image each
 * Middle → left half | right half
 * Back → full image each
 */
export function buildFlipSheets(pages) {
  const groups = { front: [], middle: [], back: [] };

  for (const page of sortPages(pages)) {
    groups[coverType(page.cover_type)].push(page);
  }

  const sheets = [];

  groups.front.forEach((page, index) => {
    sheets.push({
      id: `front-${page.page_number}-${index}`,
      kind: "image",
      src: page.image_url,
      alt: index === 0 ? "Front cover" : `Front page ${index + 1}`,
    });
  });

  groups.middle.forEach((page, index) => {
    sheets.push({
      id: `middle-left-${page.page_number}-${index}`,
      kind: "split",
      crop: "left",
      src: page.image_url,
      alt: `Spread ${index + 1}, left`,
    });
    sheets.push({
      id: `middle-right-${page.page_number}-${index}`,
      kind: "split",
      crop: "right",
      src: page.image_url,
      alt: `Spread ${index + 1}, right`,
    });
  });

  groups.back.forEach((page, index) => {
    const isLast = index === groups.back.length - 1;
    sheets.push({
      id: `back-${page.page_number}-${index}`,
      kind: "image",
      src: page.image_url,
      alt: isLast ? "Back cover" : `Back page ${index + 1}`,
    });
  });

  return sheets;
}
