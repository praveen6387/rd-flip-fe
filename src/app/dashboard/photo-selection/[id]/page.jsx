import { PhotoSelectionView } from "@/components/dashboard";
import { getPhotoSelection } from "@/lib/api/server/photo-selection";

export const metadata = {
  title: "Selection folder | RD Flip",
};

export default async function PhotoSelectionViewPage({ params }) {
  const { id } = await params;
  const { album, error } = await getPhotoSelection(id);
  return <PhotoSelectionView albumId={id} initialAlbum={album} initialError={error} />;
}
