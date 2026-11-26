import { Suspense } from "react";
import { PhotoSelectionCreate } from "@/components/dashboard";

export const metadata = {
  title: "Upload photos | Nexpic",
};

export default function PhotoSelectionCreatePage() {
  return (
    <Suspense fallback={null}>
      <PhotoSelectionCreate />
    </Suspense>
  );
}
