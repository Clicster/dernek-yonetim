import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AyProvider } from "@/lib/ay-context";

export const metadata: Metadata = {
  title: "TPD İstatistik",
  description: "TPD İstatistik Yönetim Ekibinin düzenlediği web sitesi",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <AyProvider>
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AyProvider>
      </body>
    </html>
  );
}
