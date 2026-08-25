import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
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
      <body className="relative min-h-full flex flex-col bg-[#0a0a0a] text-white">
        <Background />
        <TooltipProvider>
          <div className="relative z-10 flex min-h-full flex-1 flex-col">
            <TopHeader />
            {children}
            <Footer />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
