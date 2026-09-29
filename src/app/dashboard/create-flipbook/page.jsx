import { CreateFlipbook } from "@/components/dashboard";
import { listSongs } from "@/lib/api/server/songs";

export const metadata = {
  title: "Create Flipbook | RD Flip",
};

export default async function CreateFlipbookPage() {
  const { songs, error, unauthorized } = await listSongs();

  return (
    <CreateFlipbook
      error={unauthorized ? "Please sign in again." : error}
      songs={songs}
    />
  );
}
