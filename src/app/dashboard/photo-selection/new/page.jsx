import { Suspense } from "react";
import { PhotoSelectionCreate } from "@/components/dashboard";

export const metadata = {
  title: "Upload photos | RD Flip",
};

export default function PhotoSelectionCreatePage() {
  return (
    <Suspense fallback={null}>
      <PhotoSelectionCreate />
    </Suspense>
  );
}
