import { PhotoSelection } from "@/components/dashboard";

import { listPhotoSelections } from "@/lib/api/server/photo-selection";

export const metadata = {
  title: "Photo Selection | RD Flip",
};

export default async function PhotoSelectionPage() {
  const { albums, error } = await listPhotoSelections();
  return <PhotoSelection albums={albums} error={error} />;
}
