import ResetPasswordForm from "@/components/auth/_builder/ResetPasswordForm";

export const metadata = {
  title: "Reset password | RD Flip",
};

export default async function ResetPasswordPage({ searchParams }) {
  const params = await searchParams;
  const token = String(params?.token || "").trim();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <div className="w-full max-w-4xl">
        <ResetPasswordForm token={token} />
      </div>
    </main>
  );
}
