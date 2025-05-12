"use client"; // Required for useState and other client-side hooks

// import type { Metadata } from "next"; // Removed unused Metadata import
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import { useState } from "react"; // Import useState

const inter = Inter({ subsets: ["latin"] });

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

