import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swift Quest",
  description: "Game-first Swift and SwiftUI learning adventure",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he">
      <body>{children}</body>
    </html>
  );
}
