import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "IP Geolocation API Playground — Test API Calls Live",
  description:
    "Interactive playground for testing ipgeolocation.io IP Geolocation, Timezone, User-Agent, Astronomy, and IP Security endpoints with server-side API proxying.",
  openGraph: {
    title: "IP Geolocation API Playground — Test API Calls Live",
    description:
      "Build requests, toggle fields, inspect raw JSON, and generate cURL or language snippets for ipgeolocation.io APIs.",
    url: siteUrl,
    siteName: "IP Geolocation API Playground",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "IP Geolocation API Playground preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IP Geolocation API Playground — Test API Calls Live",
    description:
      "Interactive ipgeolocation.io sandbox for building API calls and inspecting responses.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
