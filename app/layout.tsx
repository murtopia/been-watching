import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PostHogProvider } from "@/providers/PostHogProvider";
import { ConsentBanner } from "@/components/ConsentBanner";
import ThemeScript from "@/components/theme/ThemeScript";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://beenwatching.com'),
  title: "Been Watching - Share What You're Watching",
  description: "Track and share what you've been watching with friends",
  openGraph: {
    siteName: 'Been Watching',
    title: "Been Watching - Share What You're Watching",
    description: "Track and share what you've been watching with friends",
    type: 'website',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'Been Watching' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Been Watching - Share What You're Watching",
    description: "Track and share what you've been watching with friends",
    images: ['/api/og'],
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <PostHogProvider>
          <ThemeProvider>
            <ThemeScript />
            {children}
            <ConsentBanner />
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
