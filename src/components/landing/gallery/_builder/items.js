/**
 * Gallery data
 * ------------
 * Add new entries here only.
 *
 * Images  → type display only (no click-through)
 * Flipbooks → need flipbookId; click opens FLIPBOOK_VIEW_BASE + "/" + flipbookId
 *
 * Swap src later to local files, e.g. "/gallery/cover-1.jpg"
 */

/** Change this when the real viewer route is ready */
export const FLIPBOOK_VIEW_BASE = "/view";

export function getFlipbookHref(flipbookId) {
  return `${FLIPBOOK_VIEW_BASE}/${flipbookId}`;
}

/** Static gallery photos — add { id, src, alt } */
export const GALLERY_IMAGES = [
  {
    id: "img-1",
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    alt: "Blue sky and cloud",
  },
  {
    id: "img-2",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=80",
    alt: "River valley",
  },
  {
    id: "img-3",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80",
    alt: "Beach shore",
  },
  {
    id: "img-4",
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=700&q=80",
    alt: "Snow mountains",
  },
  {
    id: "img-5",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=700&q=80",
    alt: "Green hillside",
  },
  {
    id: "img-6",
    src: "https://images.unsplash.com/photo-1499346030926-9af025052988?auto=format&fit=crop&w=700&q=80",
    alt: "Sunset sky",
  },
];

/**
 * Flipbook thumbnails — add { id, flipbookId, src, alt }
 * flipbookId is what gets appended to the view URL
 */
export const GALLERY_FLIPBOOKS = [
  {
    id: "fb-1",
    flipbookId: "demo-wedding-01",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=700&q=80",
    alt: "Wedding flipbook",
  },
  {
    id: "fb-2",
    flipbookId: "demo-portrait-02",
    src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=700&q=80",
    alt: "Portrait flipbook",
  },
  {
    id: "fb-3",
    flipbookId: "demo-event-03",
    src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=700&q=80",
    alt: "Event flipbook",
  },
  {
    id: "fb-4",
    flipbookId: "demo-studio-04",
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=700&q=80",
    alt: "Studio flipbook",
  },
  {
    id: "fb-5",
    flipbookId: "demo-couple-05",
    src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=700&q=80",
    alt: "Couple flipbook",
  },
  {
    id: "fb-6",
    flipbookId: "demo-family-06",
    src: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=700&q=80",
    alt: "Family flipbook",
  },
];
