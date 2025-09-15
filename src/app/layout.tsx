import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import type React from "react"; // Import React
import { cn } from "@/lib/utils";
import Navbar from "./(site)/Navbar";
import { ThemeProvider } from "@/components/theme-provider";

const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GroceryPicker",
  description:
    "Efficient Shopping made possible",
  keywords: [
    "GroceryPicker",
    "shopping",
    "grocery",
    "nus grocery picker",
    "hao jun mah"
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(bricolageGrotesque.className, "antialiased bg-gradient-to-b from-background via-muted/20 to-background min-h-screen")}>
        <ThemeProvider defaultTheme="system" storageKey="grocerypicker-theme">
          <Navbar/>
          <main className="pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
