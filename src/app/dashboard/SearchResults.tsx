"use client";

import React from "react";
import { Plus, ExternalLink } from "lucide-react";

export interface GroceryItem {
  id: string;
  name: string;
  price: string;
  store: string;
  quantity: string;
  description?: string;
  imageUrl?: string;
  productUrl?: string;
  promotion?: string;
  category?: string;
  inStock?: boolean;
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

  const formatPrice = (price: string): string => {
    if (!price || price === 'Price not available') {
      return 'Price N/A';
    }
    
    // If price already has currency symbol, return as is
    if (price.includes('$') || price.includes('€') || price.includes('£')) {
      return price;
    }
    
    // Try to parse as number and format as currency
    const numPrice = parseFloat(price);
    if (!isNaN(numPrice) && numPrice > 0) {
      return `$${numPrice.toFixed(2)}`;
    }
    
    // If it's not a number, return the original price string
    return price;
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
            {/* Product Image */}
            <div className="w-16 h-16 bg-muted/30 rounded-lg overflow-hidden flex-shrink-0 relative">
              {item.imageUrl ? (
                <>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-opacity"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.target as HTMLImageElement;
                      const fallback = target.nextElementSibling as HTMLElement;
                      target.style.display = 'none';
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-2xl absolute inset-0 bg-muted/30" style={{ display: 'none' }}>
                    {getProductEmoji(item.name)}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl">
                    {getProductEmoji(item.name)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Product Info */}
            <div className="flex-1 min-w-0">
              {/* Clickable Product Name */}
              {item.productUrl ? (
                <a
                  href={item.productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1 group"
                  title={`View ${item.name} on external site`}
                >
                  <span className="truncate">{item.name}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                <h3 className="font-medium text-foreground truncate" title={item.name}>
                  {item.name}
                </h3>
              )}
              
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground">{item.store}</p>
                {item.quantity && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <p className="text-sm text-muted-foreground">{item.quantity}</p>
                  </>
                )}
              </div>
              
              {item.promotion && (
                <div className="mt-1">
                  <span className="inline-block text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full">
                    {item.promotion}
                  </span>
                </div>
              )}
              
              {item.inStock !== false && (
                <span className="inline-flex items-center gap-1 text-xs text-success mt-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  Available
                </span>
              )}
            </div>
            
            {/* Price and Store Info */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-foreground">
                {formatPrice(item.price)}
              </div>
              <div className="text-sm text-muted-foreground">
                at {item.store}
              </div>
            </div>
            
            {/* Add Button */}
            <button
              onClick={() => onAddToCart(item)}
              className="px-4 py-2 bg-success text-success-foreground rounded-lg hover:bg-success/90 transition-colors font-medium flex items-center gap-2 flex-shrink-0"
              title={`Add ${item.name} to cart`}
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
