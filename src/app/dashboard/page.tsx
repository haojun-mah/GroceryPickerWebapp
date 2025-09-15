"use client";

import React, { useState } from "react";
import SearchBar from "@/app/dashboard/SearchBar";
import SearchResults, { GroceryItem } from "@/app/dashboard/SearchResults";
import ShoppingCartComponent, { CartItem } from "@/app/dashboard/ShoppingCart";

const GroceryPickerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchResults, setSearchResults] = useState<GroceryItem[]>([
    {
      id: "1",
      name: "Organic Bananas",
      price: 2.99,
      category: "Per lb • Fresh Produce",
      store: "Fresh Market",
      inStock: true,
    },
    {
      id: "2", 
      name: "Whole Milk",
      price: 3.49,
      category: "1 Gallon • Dairy",
      store: "SuperMart",
      inStock: true,
    },
    {
      id: "3",
      name: "Whole Wheat Bread",
      price: 2.79,
      category: "24oz Loaf • Bakery", 
      store: "Corner Store",
      inStock: true,
    },
  ]);

  const addToCart = (item: GroceryItem) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleSearch = () => {
    // Mock search functionality - in real app this would call an API
    console.log("Searching for:", searchQuery);
  };

  const handleCheckout = () => {
    // Mock checkout functionality
    alert("Checkout functionality would be implemented here!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Fixed Shopping Cart - Within Container Width */}
      <div className="fixed top-35 right-0 z-50 w-80 hidden lg:block" style={{
        right: `max(1rem, calc((100vw - 72rem) / 2))`,
        transform: 'translateX(calc(-100% + 20rem))'
      }}>
        <ShoppingCartComponent 
          cartItems={cartItems}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Mobile Shopping Cart - Full Width on Small Screens */}
      <div className="lg:hidden p-4 border-b border-border">
        <ShoppingCartComponent 
          cartItems={cartItems}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Scrollable Search Results Section */}
      <div className="flex-1 overflow-y-auto pt-35 px-4 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SearchResults 
              searchResults={searchResults}
              onAddToCart={addToCart}
            />
          </div>
          {/* Spacer for cart on desktop */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
      
      {/* Fixed Search Bar at Bottom - Full Width */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm p-4 z-40">
        <div className="max-w-6xl mx-auto">
          <SearchBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default GroceryPickerDashboard;
