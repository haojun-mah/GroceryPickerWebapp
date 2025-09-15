"use client";

import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "@/app/dashboard/SearchBar";
import SearchResults, { GroceryItem } from "@/app/dashboard/SearchResults";
import ShoppingCartComponent, { CartItem } from "@/app/dashboard/ShoppingCart";

const GroceryPickerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchResults, setSearchResults] = useState<GroceryItem[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchType, setSearchType] = useState<'suggestions' | 'search' | 'initial'>('initial');

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

  // Debounce function to limit API calls
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Function to fetch suggestions and display them in search results
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchType('initial');
      return;
    }

    setIsLoadingSuggestions(true);
    setSearchType('suggestions');
    
    try {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const suggestions = await response.json();
        
        // Convert suggestions to GroceryItem format
        const formattedResults: GroceryItem[] = suggestions.map((suggestion: any) => ({
          id: suggestion.id,
          name: suggestion.name,
          price: suggestion.price,
          category: suggestion.category,
          store: suggestion.store,
          inStock: true,
        }));
        
        setSearchResults(formattedResults);
      } else {
        console.error('Failed to fetch suggestions');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSearchResults([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  // Effect to fetch suggestions when searchQuery changes
  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedFetchSuggestions(searchQuery);
    } else {
      setSearchResults([]);
      setSearchType('initial');
    }
  }, [searchQuery, debouncedFetchSuggestions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    console.log("Performing full search for:", searchQuery);
    setSearchType('search');
    setIsLoadingSuggestions(true);
    
    try {
      const response = await fetch(`/api/grocerysearch?q=${encodeURIComponent(searchQuery)}&limit=15`);
      if (response.ok) {
        const searchData = await response.json();
        
        // Convert search results to GroceryItem format
        const formattedResults: GroceryItem[] = searchData.results.map((result: any) => ({
          id: result.id,
          name: result.name,
          price: result.price,
          category: result.category,
          store: result.store,
          inStock: result.inStock,
        }));
        
        setSearchResults(formattedResults);
        console.log(`Search completed with ${formattedResults.length} results using ${searchData.searchMethod} method`);
      } else {
        console.error('Search failed');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchResults([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
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
              isLoading={isLoadingSuggestions}
              searchType={searchType}
              searchQuery={searchQuery}
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
