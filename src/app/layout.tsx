import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://super-in-ai.vercel.app"),
  title: "SUPER AI | Unified Neural Orchestration & Model Comparison",
  description: "Experience absolute intelligence with SUPER AI. Compare and battle GPT-4o, Claude 3.5, Gemini 1.5, and DeepSeek in real-time. Unified high-fidelity model routing and vision eval.",
  keywords: [
    "Fiesta AI",
    "Model Battle",
    "LLM Comparison",
    "Free GPT-4o",
    "Free Claude 3.5",
    "Gemini 1.5 Battle",
    "Unified AI Dashboard",
    "AI Orchestration",
    "Best AI Models 2026"
  ],
  verification: {
    google: "f3O1uwSU8TeKQELzrxTOGy6bvrvduGNqRHqGTe3D0Nc",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/logos/logo.png" },
      { url: "/logos/logo.png", sizes: "32x32" },
      { url: "/logos/logo.png", sizes: "16x16" },
    ],
    apple: "/logos/logo.png",
    shortcut: "/logos/logo.png",
  },
  openGraph: {
    title: "Fiesta AI | The Ultimate Neural Dashboard",
    description: "Battle and Evaluate 31+ flagship AI models side-by-side. Forever free and account-less.",
    url: "https://super-in-ai.vercel.app",
    siteName: "Fiesta AI",
    images: [
      {
        url: "/logos/logo.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiesta AI | Elite Model Orchestration",
    description: "Access 31+ AI flagship models in one unified high-fidelity environment.",
    images: ["/logos/logo.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "SUPER AI",
            "url": "https://super-in-ai.vercel.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://super-in-ai.vercel.app/search?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </Script>
      </head>
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
