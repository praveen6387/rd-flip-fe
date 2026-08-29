import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Background } from "@/components/landing";
import { Footer, TopHeader } from "@/lib";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  title: "RD Flip",
  description: "RD Flip frontend",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full scroll-smooth antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-[#faf1fb] text-slate-900">
        <Background />
        <TooltipProvider>
          <Providers>
            <div className="relative z-10 flex min-h-full flex-1 flex-col">
              <TopHeader />
              {children}
              <Footer />
            </div>
            <Toaster />
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}
