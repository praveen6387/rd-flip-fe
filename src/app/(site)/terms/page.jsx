import LegalDocument from "@/components/landing/legal/LegalDocument";
import { getLegalSettings } from "@/lib/api/server/settings";

export const metadata = {
  title: "Terms & Conditions | RD Flip",
  description: "Terms and conditions for using RD Flip.",
};

export default async function TermsPage() {
  const { terms_and_conditions, error } = await getLegalSettings();

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Terms & Conditions"
      sections={terms_and_conditions}
      error={error}
      emptyMessage="Terms & conditions are not available yet."
    />
  );
}
