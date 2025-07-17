import type { Metadata } from "next";
import { Crimson_Text, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CLAIR - Centre Logiciel d'Aide aux Interventions Résidentielles",
  description: "Des interventions plus claires, des résidences plus efficaces. Projet pilote pour la gestion des résidences DI-TSA avec IA intégrée.",
  keywords: "CLAIR, Québec, DI-TSA, résidences, interventions, intelligence artificielle, healthcare, projet pilote",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "CLAIR - Centre Logiciel d'Aide aux Interventions Résidentielles",
    description: "Des interventions plus claires, des résidences plus efficaces. Projet pilote pour la gestion des résidences DI-TSA.",
    type: "website",
    locale: "fr_CA",
    siteName: "CLAIR"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${crimsonText.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
