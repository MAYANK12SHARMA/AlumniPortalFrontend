import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./hydration.css";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientToaster from "@/components/ClientToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alumni Portal",
  description:
    "Connect with alumni, find mentors, and explore career opportunities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased font-geist-sans font-geist-mono"
        style={{
          "--font-geist-sans": geistSans.variable,
          "--font-geist-mono": geistMono.variable,
        } as React.CSSProperties}
        suppressHydrationWarning
      >
        <AuthProvider>
          {children}
          <ClientToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
