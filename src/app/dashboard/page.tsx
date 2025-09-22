"use client";

import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "@/app/dashboard/SearchBar";
import SearchResults, { GroceryItem } from "@/app/dashboard/SearchResults";
import ShoppingCartComponent, { CartItem } from "@/app/dashboard/ShoppingCart";

const GroceryPickerDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchResults, setSearchResults] = useState<GroceryItem[]>([]);
  const [previousSearchResults, setPreviousSearchResults] = useState<GroceryItem[]>([]);
  const [previousSearchType, setPreviousSearchType] = useState<'suggestions' | 'search' | 'initial' | 'optimized'>('initial');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [searchType, setSearchType] = useState<'suggestions' | 'search' | 'initial' | 'optimized'>('initial');

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
      // Convert GroceryItem to CartItem, ensuring required fields are present
      const cartItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category || 'Other',
        store: item.store,
        inStock: item.inStock ?? true,
        quantity: 1,
        image: item.imageUrl
      };
      return [...prev, cartItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === itemId);
      if (existing && existing.quantity > 1) {
        // Decrease quantity if more than 1
        return prev.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      } else {
        // Remove item completely if quantity is 1 or less
        return prev.filter(cartItem => cartItem.id !== itemId);
      }
    });
  };

  const comparePrices = async (item: GroceryItem) => {
    try {
      console.log('🔍 Starting price comparison optimization for:', item.name);
      // The actual optimization logic is now handled in OptimizeButton component
      // This function can be used for any additional logic if needed
    } catch (error) {
      console.error('Price comparison failed:', error);
      alert('Failed to compare prices. Please try again.');
    }
  };

  const handleOptimizeStart = () => {
    // Store current results before optimization
    setPreviousSearchResults(searchResults);
    setPreviousSearchType(searchType);
    setIsOptimizing(true);
    console.log('Starting optimization, stored previous results');
  };

  const handleOptimizeResults = (optimizedResults: GroceryItem[]) => {
    // Replace current search results with optimized results
    setSearchResults(optimizedResults);
    setSearchType('optimized');
    setIsOptimizing(false);
    console.log(`Updated search results with ${optimizedResults.length} optimized items`);
  };

  const handleBackToOriginal = () => {
    // Restore previous search results
    setSearchResults(previousSearchResults);
    setSearchType(previousSearchType);
    setPreviousSearchResults([]);
    setPreviousSearchType('initial');
    console.log('Restored previous search results');
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

  // Function to fetch suggestions with two-phase approach
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchType('initial');
      return;
    }

    setIsLoadingSuggestions(true);
    setSearchType('suggestions');
    
    try {
      // Phase 1: Get immediate regex results
      console.log('🔄 Phase 1: Fetching regex results...');
      const regexResponse = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}&limit=30&phase=regex`);
      
      if (regexResponse.ok) {
        const regexData = await regexResponse.json();
        
        // Convert suggestions to GroceryItem format
        const formatSuggestions = (suggestions: any[]) => suggestions.map((suggestion: any) => ({
          id: suggestion.id,
          name: suggestion.name,
          price: suggestion.price,
          store: suggestion.store,
          quantity: suggestion.quantity || '',
          description: suggestion.promotion,
          imageUrl: suggestion.image_url,
          productUrl: suggestion.product_url,
          promotion: suggestion.promotion,
          category: suggestion.category,
          inStock: true,
        }));

        const regexResults = formatSuggestions(regexData.suggestions || []);
        console.log(`✅ Phase 1 complete: ${regexResults.length} regex results`);
        
        // Immediately show regex results
        setSearchResults(regexResults);

        // Phase 2: Get RAG results to completely replace regex results
        console.log('🔄 Phase 2: Fetching enhanced RAG results...');
        
        // Don't set loading for second phase to avoid UI flicker
        const ragResponse = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}&limit=30&phase=rag`);
        
        if (ragResponse.ok) {
          const ragData = await ragResponse.json();
          const ragResults = formatSuggestions(ragData.suggestions || []);
          console.log(`✅ Phase 2 complete: ${ragResults.length} RAG results`);
          
          // Replace regex results with ranked RAG results
          if (ragResults.length > 0) {
            console.log(`🎯 Replacing with RAG results: ${ragResults.length} relevance-ranked suggestions`);
            setSearchResults(ragResults);
          } else {
            console.warn('No RAG results, keeping regex results');
          }
        } else {
          console.warn('Phase 2 (RAG) failed, keeping regex results');
        }
      } else {
        console.error('Failed to fetch regex suggestions');
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
          store: result.store,
          quantity: result.quantity || '',
          description: result.description,
          imageUrl: result.imageUrl,
          productUrl: result.productUrl,
          promotion: result.promotion,
          category: result.category,
          inStock: result.inStock !== false,
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
            {/* Fixed Shopping Cart - Within Container Width */}
      <div className="fixed top-35 right-0 z-50 w-80 hidden lg:block" style={{
        right: `max(1rem, calc((100vw - 72rem) / 2))`,
        transform: 'translateX(calc(-100% + 20rem))'
      }}>
        <ShoppingCartComponent 
          cartItems={cartItems}
          onCheckout={handleCheckout}
          onRemoveItem={removeFromCart}
        />
      </div>

      {/* Mobile Shopping Cart - Full Width on Small Screens */}
      <div className="lg:hidden p-4 border-b border-border">
        <ShoppingCartComponent 
          cartItems={cartItems}
          onCheckout={handleCheckout}
          onRemoveItem={removeFromCart}
        />
      </div>

      {/* Scrollable Search Results Section */}
      <div className="flex-1 overflow-y-auto pt-35 px-4 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SearchResults 
              searchResults={searchResults}
              onAddToCart={addToCart}
              onComparePrices={comparePrices}
              onOptimizeResults={handleOptimizeResults}
              onOptimizeStart={handleOptimizeStart}
              onBackToOriginal={handleBackToOriginal}
              isLoading={isLoadingSuggestions}
              isOptimizing={isOptimizing}
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
