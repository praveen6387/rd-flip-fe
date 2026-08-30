import { getPublicFlipbook } from "@/lib/api/server/flipbook";
import FlipbookView from "@/components/flipbook-view";

export const revalidate = 1800;

export default async function FlipbookViewPage({ params }) {
  const { flip_id } = await params;
  const { flipbook, error } = await getPublicFlipbook(flip_id);

  return <FlipbookView flipbook={flipbook} error={error} />;
}
