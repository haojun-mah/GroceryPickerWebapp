"use client";

import React from "react";
import { Plus } from "lucide-react";

export interface GroceryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  store: string;
  inStock: boolean;
  image?: string;
}

interface SearchResultsProps {
  searchResults: GroceryItem[];
  onAddToCart: (item: GroceryItem) => void;
  isLoading?: boolean;
  searchType?: 'suggestions' | 'search' | 'initial';
  searchQuery?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onAddToCart,
  isLoading = false,
  searchType = 'initial',
  searchQuery = ''
}) => {
  const getProductEmoji = (name: string) => {
    if (name.includes('Banana')) return '🍌';
    if (name.includes('Milk')) return '🥛';
    if (name.includes('Bread')) return '🍞';
    return '🛒';
  };

  // Get header text based on search type
  const getHeaderText = () => {
    if (isLoading) return 'Loading...';
    if (searchType === 'suggestions' && searchQuery) return `Suggestions for "${searchQuery}"`;
    if (searchType === 'search' && searchQuery) return `Search Results for "${searchQuery}"`;
    if (searchType === 'initial') return 'Welcome to GroceryPicker';
    return 'Search Results';
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{getHeaderText()}</h2>
          {isLoading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          )}
        </div>
        {searchType === 'suggestions' && searchResults.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Start typing to see suggestions, or press Enter to search
          </p>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Loading state */}
        {isLoading && searchResults.length === 0 && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Searching for products...</p>
          </div>
        )}

        {/* Empty state for initial load */}
        {searchType === 'initial' && searchResults.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to find great deals?</h3>
            <p className="text-muted-foreground">Start typing in the search bar below to find products and compare prices across stores.</p>
          </div>
        )}

        {/* No results state */}
        {!isLoading && searchResults.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground">Try searching for something else or check your spelling.</p>
          </div>
        )}

        {/* Results */}
        {searchResults.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors">
            {/* Product Image Placeholder */}
            <div className="w-16 h-16 bg-muted/30 rounded-lg flex items-center justify-center">
              <span className="text-2xl">
                {getProductEmoji(item.name)}
              </span>
            </div>
            
            {/* Product Info */}
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.category}</p>
              {item.inStock && (
                <span className="inline-flex items-center gap-1 text-xs text-success mt-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  In Stock
                </span>
              )}
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-lg font-bold text-foreground">${item.price.toFixed(2)}</div>
            </div>
            
            {/* Add Button */}
            <button
              onClick={() => onAddToCart(item)}
              className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
