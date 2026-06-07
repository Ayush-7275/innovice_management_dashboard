import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. Import the font
import "./globals.css";

// 2. Configure the font (creates a CSS variable called --font-sans)
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans", 
});

export const metadata: Metadata = {
  title: "Powerplay Invoice Dashboard",
  description: "B2B Invoice Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Apply the variable and Tailwind's font-sans class globally */}
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}