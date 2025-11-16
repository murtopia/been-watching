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
  title: "Been Watching - Share What You're Watching",
  description: "Track and share what you've been watching with friends",
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
