import { Flipbook } from "@/components/dashboard";
import { listFlipbooks } from "@/lib/api/server/flipbook";

export const metadata = {
  title: "Flipbook | RD Flip",
};

export default async function FlipbookPage() {
  const { flipbooks, error, unauthorized } = await listFlipbooks();

  return (
    <Flipbook
      flipbooks={flipbooks}
      error={unauthorized ? "Please sign in again." : error}
    />
  );
}
