import { ContactMessages } from "@/components/dashboard";
import { AdminGuard } from "@/lib/dashboard";
import { listAdminContactMessages } from "@/lib/api/server/contact";

export const metadata = {
  title: "Contact Us | Nexpic",
};

export default async function ContactPage() {
  const { messages, error, unauthorized } = await listAdminContactMessages();

  return (
    <AdminGuard>
      <ContactMessages
        messages={messages}
        error={unauthorized ? "Please sign in again." : error}
      />
    </AdminGuard>
  );
}
