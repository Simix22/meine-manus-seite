"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setLoadingSession(false);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      // If logged out, and on a page that should now hide nav, this will trigger re-render.
      // If logged in, this will also trigger re-render.
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, [supabase, pathname]); // Add pathname to re-check if needed, though onAuthStateChange should cover most cases

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Define paths where the main navigation (Sidebar, Header, BottomNav) should be hidden
  const noNavPaths = ["/login", "/register", "/verify-email", "/sign-out"];
  const showNav = !noNavPaths.includes(pathname) && session;

  if (loadingSession && !noNavPaths.includes(pathname)) {
    // Optional: Show a global loader while session is being determined for protected layout parts
    // However, middleware should handle redirection before this layout is fully interactive for protected routes
    // For now, we allow children to render to avoid blocking public content if any were part of this layout
  }

  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-100`}>
        {showNav ? (
          <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
            <div className="flex-1 flex flex-col md:ml-64">
              <Header toggleMobileSidebar={toggleMobileSidebar} />
              <main className="flex-1 p-4 md:p-6">
                {children}
              </main>
              <BottomNav />
            </div>
          </div>
        ) : (
          // Layout for pages without main navigation (e.g., login, register)
          // Children will be the page content for /login, /register etc.
          <main className="min-h-screen">
            {children}
          </main>
        )}
      </body>
    </html>
  );
}
