import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

export const metadata: Metadata = {
  title: "AI Opportunity Analyzer",
  description:
    "Generate structured, consultant-grade AI opportunity reports from public company websites."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-canvas">
      <body
        className={[
          inter.variable,
          "min-h-full font-sans antialiased",
          "text-primary"
        ].join(" ")}
      >
        {children}
      </body>
    </html>
  );
}

