import { Background } from "@/components/landing";
import { Footer, TopHeader } from "@/lib";

export default function SiteLayout({ children }) {
  return (
    <>
      <Background />
      <div className="relative z-10 flex min-h-full flex-1 flex-col">
        <TopHeader />
        {children}
        <Footer />
      </div>
    </>
  );
}
