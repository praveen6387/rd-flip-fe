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
    if(index === 0) {
      sheets.push({
        id: `front-${page.page_number}-${index}`,
        kind: "image",
        src: page.image_url,
        alt: "Front cover",
      });
    } else {
      sheets.push({
        id: `front-blank-${page.page_number}-${index}`,
        kind: "image",
        src: "/white.png",
        alt: `Blank page ${index + 1}`,
      });

      sheets.push({
        id: `front-image-${page.page_number}-${index}`,
        kind: "image",
        src: page.image_url,
        alt: `Image page ${index + 1}`,
      });
    }
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
    if(isLast) {
      sheets.push({
        id: `back-cover-${page.page_number}-${index}`,
        kind: "image",
        src: page.image_url,
        alt: "Back cover",
      });
    } else {
      sheets.push({
        id: `back-blank-${page.page_number}-${index}`,
        kind: "blank",
        src: page.image_url,
        alt: `Blank page ${index + 1}`,
      });
      sheets.push({
        id: `back-image-${page.page_number}-${index}`,
        kind: "image",
        src: '/white.png',
        alt: `Image page ${index + 1}`,
      });
    }
  });

  return sheets;
}
