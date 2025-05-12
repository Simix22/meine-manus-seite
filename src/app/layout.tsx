"use client"; // Required for useState and other client-side hooks

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { useState } from "react"; // Import useState

const inter = Inter({ subsets: ["latin"] });

// Metadata cannot be in a client component, so we keep it separate or handle it differently if RootLayout becomes 'use client'
// For now, assuming metadata is static and can remain. If dynamic metadata is needed with 'use client', alternative approaches are necessary.
// export const metadata: Metadata = { // This will cause an error if RootLayout is 'use client' directly
//   title: "Fanfix Clone",
//   description: "Image selling platform for content creators",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <html lang="de">
      <body className={`${inter.className} bg-gray-100`}>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar isMobileOpen={isMobileSidebarOpen} toggleMobileSidebar={toggleMobileSidebar} />
          <div className="flex-1 flex flex-col md:ml-64"> {/* Add margin-left for desktop to accommodate fixed sidebar */}
            <Header toggleMobileSidebar={toggleMobileSidebar} />
            <main className="flex-1 p-4 md:p-6">
              {children}
            </main>
            <BottomNav />
          </div>
        </div>
      </body>
    </html>
  );
}

