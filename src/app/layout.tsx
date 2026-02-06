import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LiveAlertSystem } from "@/components/LiveAlertSystem";

// Font optimization: We lean heavily on Mono for the terminal feel
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TraceAm | Cyber-Threat Intelligence Grid",
  description: "Real-time scam tracking and entity verification for the Nigerian digital ecosystem.",
  icons: {
    icon: "/favicon.ico", // Ensure you have a favicon in /public
  },
};

export const viewport: Viewport = {
  themeColor: "#01030a", // Matches your deep space background
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#01030a] text-cyan-400 min-h-screen flex flex-col`}
      >
        {/* Layout Wrapper */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Global Surveillance Overlay */}
        
        
        {/* Note: Navbar is usually added here if it's on every page.
          If it's only on specific pages, keep it inside the page.tsx 
        */}
      </body>
    </html>
  );
}