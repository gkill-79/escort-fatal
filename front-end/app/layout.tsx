import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

export const viewport: Viewport = {
  themeColor: "#0a0d14", // Consistent with your dark background
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prévenir le zoom lors des inputs
};

export const metadata: Metadata = {
  title: "Escorte Fatal — Annonces Escortes France",
  description: "Rencontrez des escortes et modèles près de chez vous.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Escorte Fatal",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0a0d14] text-white antialiased">
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
