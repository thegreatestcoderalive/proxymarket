// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Syne, Figtree, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ProxyMarket — Premium Web Proxy Services",
    template: "%s | ProxyMarket",
  },
  description:
    "The definitive marketplace for professional web proxy services. Ultraviolet, Rammerhead, WISP, Meteor, Dynamic — choose the architecture that fits your workflow.",
  keywords: [
    "web proxy",
    "ultraviolet proxy",
    "rammerhead",
    "wisp proxy",
    "service worker proxy",
    "bypass filter",
    "privacy proxy",
  ],
  authors: [{ name: "ProxyMarket" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "ProxyMarket — Premium Web Proxy Services",
    description: "The definitive marketplace for professional web proxy services.",
    siteName: "ProxyMarket",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProxyMarket — Premium Web Proxy Services",
  },
};

export const viewport: Viewport = {
  themeColor: "#080809",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${figtree.variable} ${jetbrains.variable}`}
    >
      <body className="font-body bg-void text-chalk antialiased selection:bg-ember/30 selection:text-ember-200">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1C1C22",
              color: "#F0EEF8",
              border: "1px solid #2F2F3A",
              borderRadius: "10px",
              fontFamily: "var(--font-figtree)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#2DD4A0", secondary: "#1C1C22" },
            },
            error: {
              iconTheme: { primary: "#E8445A", secondary: "#1C1C22" },
            },
          }}
        />
      </body>
    </html>
  );
}
