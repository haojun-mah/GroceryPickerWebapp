
"use client";

import Link from "next/link";
import { RainbowButton } from "@/components/magicui/rainbow-button";

const HeroSection = () => {
  return (
    <div className="overflow-x-hidden bg-background">
      <section className="pt-24 sm:pt-32 md:pt-40 lg:pt-48 bg-background pb-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-6 mb-16">
              <img
                src="/icon.png"
                alt="GroceryPicker Logo"
                className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 flex-shrink-0 object-contain"
              />
              <div className="text-left">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                  GroceryPicker
                </h1>
                <p className="text-xl sm:text-2xl md:text-3xl text-muted-foreground mt-2">
                  Efficient shopping made possible
                </p>
              </div>
            </div>
            <p className="text-3xl font-bold leading-tight text-foreground sm:leading-tight sm:text-4xl lg:text-5xl lg:leading-tight">
              Compare
              <span className="relative inline-flex sm:inline">
                <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
                <span className="relative"> hundreds </span>
              </span>
              of grocery prices with a single click
            </p>

            <div className="px-8 pt-4 sm:items-center sm:justify-center sm:px-0 sm:space-x-5 sm:flex mt-9">
              <RainbowButton
                  asChild
                  className="inline-flex items-center justify-center w-full px-12 py-5 text-3xl font-bold text-primary-foreground transition-all duration-200 bg-primary border-2 border-transparent sm:w-auto rounded-2xl hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring min-w-[280px] h-16"
              >
                <Link href="/dashboard">
                  Start Smart Shopping
                </Link>
              </RainbowButton>
            </div>

          </div>
        </div>

 
      </section>
    </div>
  );
};

export default HeroSection;
