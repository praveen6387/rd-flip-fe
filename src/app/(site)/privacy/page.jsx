import LegalDocument from "@/components/landing/legal/LegalDocument";
import { getLegalSettings } from "@/lib/api/server/settings";

export const metadata = {
  title: "Privacy Policy | RD Flip",
  description: "How RD Flip collects, uses, and protects your information.",
};

export default async function PrivacyPolicyPage() {
  const { privacy_policy, error } = await getLegalSettings();

  return (
    <LegalDocument
      eyebrow="Legal"
      title="Privacy Policy"
      sections={privacy_policy}
      error={error}
      emptyMessage="Privacy policy is not available yet."
    />
  );
}
