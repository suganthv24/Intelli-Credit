import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intelli-Credit AI Intelligence",
  description: "End-to-end AI-powered credit appraisal system by Intelli-Credit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-ai-bg text-ai-fg antialiased min-h-screen selection:bg-ai-blue/30 selection:text-ai-blue`}
      >
        <div className="flex min-h-screen w-full flex-col bg-[#1D1D20]">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-[#3f3f46] bg-[#1D1D20]/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ai-blue text-[#1D1D20]">
                I
              </div>
              <span className="bg-gradient-to-r from-ai-blue to-ai-green bg-clip-text text-transparent">
                Intelli-Credit AI Intelligence
              </span>
            </div>
            <nav className="ml-auto flex items-center gap-6 text-sm font-medium">
              <a href="#" className="text-ai-fg transition-colors hover:text-ai-blue">Dashboard</a>
              <a href="#" className="text-ai-fg2 transition-colors hover:text-ai-fg">Upload Docs</a>
              <a href="#" className="text-ai-fg2 transition-colors hover:text-ai-fg">Reports</a>
            </nav>
            <div className="ml-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#27272a] text-xs font-medium border border-[#3f3f46]">
              CO
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-x-hidden p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
