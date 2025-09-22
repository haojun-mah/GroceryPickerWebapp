"use client";

import React from "react";
import { Plus, ExternalLink, ArrowLeft } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import OptimizeButton from "./OptimizeButton";

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
  onComparePrices?: (item: GroceryItem) => void;
  onOptimizeResults?: (results: GroceryItem[]) => void;
  onOptimizeStart?: () => void;
  onBackToOriginal?: () => void;
  isLoading?: boolean;
  isOptimizing?: boolean;
  searchType?: 'suggestions' | 'search' | 'initial' | 'optimized';
  searchQuery?: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onAddToCart,
  onComparePrices,
  onOptimizeResults,
  onOptimizeStart,
  onBackToOriginal,
  isLoading = false,
  isOptimizing = false,
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
    if (isOptimizing) return 'Finding cheapest...';
    if (isLoading) return 'Loading...';
    if (searchType === 'optimized') return 'Cheapest Options';
    if (searchType === 'suggestions' && searchQuery) return `Suggestions for "${searchQuery}"`;
    if (searchType === 'search' && searchQuery) return `Search Results for "${searchQuery}"`;
    if (searchType === 'initial') return 'Enter groceries to start';
    return 'Search Results';
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {searchType === 'optimized' && onBackToOriginal && (
              <button
                onClick={onBackToOriginal}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                aria-label="Back to original results"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground">{getHeaderText()}</h2>
          </div>
          {(isLoading || isOptimizing) && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          )}
        </div>
        {searchType === 'suggestions' && searchResults.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            Start typing to see suggestions, or press Enter to search
          </p>
        )}
        {searchType === 'optimized' && (
          <p className="text-sm text-muted-foreground mt-1">
            Showing the 5 cheapest alternatives sorted by price
          </p>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Loading state */}
        {isLoading && searchResults.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Searching for products...</p>
          </div>
        )}

        {/* Empty state for initial load - only show when no search has been performed */}
        {searchType === 'initial' && searchResults.length === 0 && !isLoading && !searchQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to find great deals?</h3>
          </div>
        )}

        {/* No results state - show when search has been performed but no results found */}
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
                {item.quantity && (
                  <>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
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
            </div>
            
            {/* Price and Store Info */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-foreground">
                {item.price}
              </div>
              <div className="text-sm text-muted-foreground">
              {item.store}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Optimize Button */}
              {onComparePrices && (
                <OptimizeButton 
                  item={item} 
                  onOptimize={onComparePrices} 
                  onOptimizeResults={onOptimizeResults}
                  onOptimizeStart={onOptimizeStart}
                />
              )}
              
              {/* Add to Cart Button */}
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="p-2 text-muted-foreground hover:text-success hover:bg-success/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">🛒 Add to Cart</h4>
                    <p className="text-sm text-muted-foreground">
                      Add <strong>{item.name}</strong> from <strong>{item.store}</strong> to your shopping cart.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Price: <span className="font-medium">{item.price}</span>
                      {item.quantity && (
                        <span> • Quantity: {item.quantity}</span>
                      )}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
