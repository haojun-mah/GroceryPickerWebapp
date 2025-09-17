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
  title: {
    default: "GroceryPicker - Smart AI-Powered Grocery Shopping | NUS Computer Science Project",
    template: "%s | GroceryPicker - AI Shopping Assistant"
  },
  description: "Revolutionary AI-powered grocery shopping platform built by Mah Hao Jun from NUS Computer Science. Compare prices, find deals, and shop smarter with semantic search technology. Discover the future of efficient grocery shopping.",
  keywords: [
    // Core product keywords
    "GroceryPicker", "AI grocery shopping", "smart shopping", "grocery price comparison", "semantic search grocery",
    "grocery deals finder", "intelligent shopping assistant", "automated grocery shopping", "grocery AI technology",
    
    // NUS & Academic keywords
    "NUS", "National University Singapore", "NUS Computer Science", "NUS CS", "computer science project",
    "NUS student project", "Singapore university", "CS final year project", "NUS technology",
    
    // Personal/Developer keywords
    "Mah Hao Jun", "hao jun mah", "haojun mah", "mah haojun", "CS student NUS", "Singapore developer",
    "NUS CS graduate", "computer science singapore",
    
    // Technology keywords
    "Next.js grocery app", "React shopping platform", "TypeScript grocery", "Supabase grocery",
    "vector database shopping", "embedding search grocery", "RAG grocery search",
    
    // Local/Regional keywords
    "Singapore grocery", "grocery shopping Singapore", "smart shopping Singapore", "AI shopping Singapore",
    "grocery price comparison Singapore", "singapore supermarket comparison",
    
    // Singapore Supermarkets - Major Chains
    "NTUC FairPrice", "FairPrice", "NTUC grocery", "FairPrice price comparison", "FairPrice deals",
    "Cold Storage", "Cold Storage Singapore", "Cold Storage prices", "Cold Storage grocery",
    "Giant Singapore", "Giant supermarket", "Giant grocery prices", "Giant hypermarket",
    "Sheng Siong", "Sheng Siong supermarket", "Sheng Siong prices", "Sheng Siong deals",
    "Prime Supermarket", "Prime grocery", "Prime Singapore", "Prime supermarket prices",
    "Redmart", "Redmart Singapore", "Redmart grocery", "Redmart delivery",
    "Mustafa Centre", "Mustafa grocery", "Mustafa 24 hours", "Mustafa supermarket",
    "Don Don Donki", "Donki Singapore", "Don Don Donki grocery", "Japanese supermarket Singapore",
    "Marketplace by Jasons", "Jasons Singapore", "Jasons grocery", "premium supermarket Singapore",
    "CS Fresh", "CS Fresh supermarket", "CS Fresh Singapore",
    "U Stars Supermarket", "U Stars Singapore", "budget supermarket Singapore",
    
    // Specialty & Organic Stores
    "Ryan's Grocery", "Organic supermarket Singapore", "Little Farms", "Brown Rice Paradise",
    "Natura Singapore", "SaladStop grocery", "health food store Singapore",
    
    // Online Grocery Platforms
    "Amazon Fresh Singapore", "HonestBee", "grocery delivery Singapore", "online grocery Singapore",
    "Grab supermarket", "foodpanda grocery", "grocery app Singapore",
    
    // Wet Markets & Traditional
    "wet market Singapore", "market Singapore", "fresh market Singapore", "traditional market Singapore",
    "Tekka Market", "Chinatown Market", "neighbourhood supermarket Singapore"
  ],
  authors: [{ name: "Mah Hao Jun", url: "https://github.com/haojun-mah" }],
  creator: "Mah Hao Jun - NUS Computer Science",
  publisher: "GroceryPicker by Mah Hao Jun",
  applicationName: "GroceryPicker",
  category: "Shopping & E-commerce",
  classification: "AI-Powered Shopping Assistant",
  
  // Open Graph for social media
  openGraph: {
    title: "GroceryPicker - AI-Powered Smart Grocery Shopping",
    description: "Revolutionary grocery shopping platform with AI-powered price comparison and semantic search. Built by Mah Hao Jun from NUS Computer Science.",
    url: "https://grocerypicker.online",
    siteName: "GroceryPicker",
    locale: "en_SG",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "GroceryPicker - AI Grocery Shopping Logo"
      }
    ]
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "GroceryPicker - AI-Powered Grocery Shopping",
    description: "Smart grocery shopping with AI price comparison. NUS CS project by Mah Hao Jun.",
    creator: "@haojunmah",
    images: ["/icon.png"]
  },
  
  // Icons
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  
  // Additional metadata
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification for search engines
  verification: {
    google: "your-google-site-verification-code", // You'll need to add this from Google Search Console
  },
  
  // Additional SEO
  alternates: {
    canonical: "https://grocerypicker.online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "GroceryPicker",
              "description": "AI-powered grocery shopping platform with price comparison and semantic search technology",
              "url": "https://grocerypicker.online",
              "applicationCategory": "ShoppingApplication",
              "operatingSystem": "Web Browser",
              "author": {
                "@type": "Person",
                "name": "Mah Hao Jun",
                "affiliation": {
                  "@type": "EducationalOrganization",
                  "name": "National University of Singapore",
                  "department": "School of Computing",
                  "alternateName": "NUS Computer Science"
                },
                "sameAs": "https://github.com/haojun-mah"
              },
              "creator": {
                "@type": "Person",
                "name": "Mah Hao Jun",
                "jobTitle": "Computer Science Student",
                "affiliation": "National University of Singapore"
              },
              "keywords": "AI grocery shopping, price comparison, semantic search, NUS computer science, smart shopping Singapore, NTUC FairPrice, Cold Storage, Giant, Sheng Siong, Prime Supermarket, Redmart, Don Don Donki, Singapore supermarket comparison",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "SGD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "ratingCount": "1",
                "bestRating": "5"
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://grocerypicker.online/dashboard?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
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
