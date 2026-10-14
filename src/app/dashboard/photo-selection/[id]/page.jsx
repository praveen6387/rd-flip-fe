import { PhotoSelectionView } from "@/components/dashboard";

export const metadata = {
  title: "Selection folder | RD Flip",
};

export default async function PhotoSelectionViewPage({ params }) {
  const { id } = await params;
  return <PhotoSelectionView albumId={id} />;
}
