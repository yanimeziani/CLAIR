import type { Metadata } from "next";
import { Crimson_Text, Inter } from "next/font/google";
import "./globals.css";
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
  title: "LUCIDE Analytics - Analyse Intelligente pour CLAIR",
  description: "Tableau de bord d'analytique en temps réel avec cartes thermiques et intelligence visiteur pour le système CLAIR.",
  keywords: "LUCIDE, CLAIR, analytics, heatmap, visitor intelligence, healthcare analytics, québec",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "LUCIDE Analytics - Analyse Intelligente pour CLAIR",
    description: "Tableau de bord d'analytique en temps réel avec cartes thermiques et intelligence visiteur.",
    type: "website",
    locale: "fr_CA",
    siteName: "LUCIDE Analytics"
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
        </ThemeProvider>
      </body>
    </html>
  );
}