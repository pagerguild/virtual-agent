import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-provider";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Virtual Agent",
  description: "Tour logistics automation for performing artists",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-white text-gray-900 antialiased">
        <QueryProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
