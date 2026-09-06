import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Font Preview",
  description: "Preview teks dengan semua font dari folder lokal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
