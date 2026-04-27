import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prodoc AI — Intelligent Clinical Copilot",
  description: "Next-generation autonomous healthcare intelligence platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
