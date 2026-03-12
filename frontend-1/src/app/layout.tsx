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
  title: "Zerve Credit Intelligence",
  description: "End-to-end AI-powered credit appraisal system by Zerve",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-zerve-bg text-zerve-fg antialiased min-h-screen selection:bg-zerve-blue/30 selection:text-zerve-blue`}
      >
        <div className="flex min-h-screen w-full flex-col bg-[#1D1D20]">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-[#3f3f46] bg-[#1D1D20]/80 px-6 backdrop-blur-md">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zerve-blue text-[#1D1D20]">
                Z
              </div>
              <span className="bg-gradient-to-r from-zerve-blue to-zerve-green bg-clip-text text-transparent">
                Zerve Credit Intelligence
              </span>
            </div>
            <nav className="ml-auto flex items-center gap-6 text-sm font-medium">
              <a href="#" className="text-zerve-fg transition-colors hover:text-zerve-blue">Dashboard</a>
              <a href="#" className="text-zerve-fg2 transition-colors hover:text-zerve-fg">Upload Docs</a>
              <a href="#" className="text-zerve-fg2 transition-colors hover:text-zerve-fg">Reports</a>
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
