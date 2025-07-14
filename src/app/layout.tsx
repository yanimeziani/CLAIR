import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CLAIR - Centre Logiciel d'Aide aux Interventions Résidentielles",
  description: "Des interventions plus claires, des résidences plus efficaces. Solution MSSS pour la gestion des résidences DI-TSA avec IA intégrée.",
  keywords: "CLAIR, MSSS, Québec, DI-TSA, résidences, interventions, intelligence artificielle, healthcare",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  metadataBase: new URL('https://clair.msss.gouv.qc.ca'),
  openGraph: {
    title: "CLAIR - Centre Logiciel d'Aide aux Interventions Résidentielles",
    description: "Des interventions plus claires, des résidences plus efficaces. Solution MSSS pour la gestion des résidences DI-TSA.",
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
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
