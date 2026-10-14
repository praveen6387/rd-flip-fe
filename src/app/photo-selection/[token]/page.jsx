import ClientSelection from "@/components/dashboard/PhotoSelection/Client";
export const metadata = { title: "Select your photos", robots: { index: false, follow: false } };
export default async function SelectionPage({ params }) { const { token } = await params; return <ClientSelection token={token} />; }
