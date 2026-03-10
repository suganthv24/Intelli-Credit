"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      // Protected routes logic
      if (!pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
        router.push("/login");
      }
    }
  }, [pathname, router]);

  // Avoid hydration mismatch by not rendering layout-specifics until client is mounted
  if (!isClient) return <>{children}</>;

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
