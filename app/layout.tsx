import type { Metadata, Viewport } from "next";
import { Big_Shoulders_Display, Public_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import TabBar from "./tab-bar";

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "TSS HQ",
  description: "Command center for The Second Spin's AI agents.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#14110f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${bigShoulders.variable} ${publicSans.variable} ${spaceMono.variable}`}
        style={{ fontFamily: "var(--font-body), sans-serif" }}
      >
        {children}
        <TabBar />
      </body>
    </html>
  );
}
