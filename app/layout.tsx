import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Escorte Fatal — Annonces Escortes France",
  description: "Rencontrez des escortes et modèles près de chez vous.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-[#0a0d14] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
