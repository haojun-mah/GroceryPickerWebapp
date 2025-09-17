"use client";

import Link from "next/link";
import { Home, LogIn } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-3">
            <img
                src="/icon.png"
                alt="GroceryPicker Logo"
                className="w-8 h-8 flex-shrink-0 object-contain"
              />
            <span className="text-xl font-bold text-foreground">GroceryPicker</span>
          </Link>
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
          
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
