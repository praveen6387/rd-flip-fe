import LegalDocument from "@/components/landing/legal/LegalDocument";
import { getLegalSettings } from "@/lib/api/server/settings";

export const metadata = {
  title: "Refund Policy | Nexpic",
  description: "Refund eligibility, processing, and related terms for Nexpic.",
};

export default async function RefundPage() {
  const { refund, error } = await getLegalSettings();

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Refund Policy"
      sections={refund}
      error={error}
      emptyMessage="Refund policy is not available yet."
    />
  );
}
