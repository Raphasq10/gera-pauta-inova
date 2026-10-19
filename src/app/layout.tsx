import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InovaPauta AI • Festival Iguassu Inova 2026",
  description: "Gerador inteligente de pautas para redes sociais baseado nos 7.065 inscritos adultos do Festival Iguassu Inova 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} font-sans h-full antialiased dark`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col font-sans bg-slate-950 text-slate-100"
      >
        {children}
      </body>
    </html>
  );
}

