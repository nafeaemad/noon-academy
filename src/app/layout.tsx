import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://noonquran.academy"),
  title: { default: "Noon Academy | Online Quran Learning", template: "%s | Noon Academy" },
  description: "Personal online Quran, Tajweed, and Arabic reading lessons for non-Arabic speakers—children and adults.",
  keywords: ["Quran online", "Tajweed lessons", "Quran for non-Arabic speakers", "تعليم القرآن أونلاين"],
  openGraph: { title: "Noon Academy for Quran Learning", description: "Learn Quran with clarity and confidence through live one-to-one lessons.", type: "website", locale: "en_US", alternateLocale: "ar_AR", siteName: "Noon Academy" },
  robots: { index: true, follow: true },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Noon Academy" },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c3b2e",
};

const schema = { "@context": "https://schema.org", "@type": "EducationalOrganization", name: "Noon Academy for Teaching the Quran to Non-Arabic Speakers", alternateName: "أكاديمية نون لتعليم الأعاجم القرآن الكريم", url: "https://noonquran.academy", email: "hello@noonquran.academy", description: "Online Quran and Tajweed education for non-Arabic speakers.", areaServed: "Worldwide" };

export default function RootLayout({ children }: { children: ReactNode }) {
 return <html lang="en" suppressHydrationWarning><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}/><PwaRegister/><AppShell>{children}</AppShell></body></html>;
}
