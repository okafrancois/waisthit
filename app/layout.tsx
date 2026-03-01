import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Boya - Frappe au portefeuille",
  description:
    "Résiliations publiques, chiffres réels. La pression économique au service du changement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.className} ${inter.variable} antialiased min-h-screen bg-slate-950 flex flex-col`}
      >
        <ConvexClientProvider>
          {children}
          <Toaster richColors position="top-center" />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
