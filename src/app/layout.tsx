import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://sora-ion-ai.netlify.app"), // Updated candidate for Netlify
  title: "Fiesta AI | Unified Neural Orchestration & Model Comparison",
  description: "Experience absolute intelligence. Compare and battle GPT-4o, Claude 3.5, Gemini 1.5, and DeepSeek in real-time. Unified high-fidelity model routing and vision eval.",
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
    google: "vi6sMrNbzQC1osOVH2v4haUq3o8O2J0eAIJq_b7HJN8",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/logos/logo.png",
    apple: "/logos/logo.png",
  },
  openGraph: {
    title: "Fiesta AI | The Ultimate Neural Dashboard",
    description: "Battle and Evaluate 31+ flagship AI models side-by-side. Forever free and account-less.",
    url: "https://sora-ion-ai.netlify.app",
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
      <body className={outfit.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
