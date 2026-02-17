import type { Metadata } from "next";
import { plusJakarta } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jamaica House Brand - Original Jerk Sauce",
  description: "Authentic Jamaican jerk sauce with 30+ years of restaurant heritage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} dark`}>
      <body className="bg-brand-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}
