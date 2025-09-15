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
}

const SearchResults: React.FC<SearchResultsProps> = ({ 
  searchResults, 
  onAddToCart 
}) => {
  const getProductEmoji = (name: string) => {
    if (name.includes('Banana')) return '🍌';
    if (name.includes('Milk')) return '🥛';
    if (name.includes('Bread')) return '🍞';
    return '🛒';
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
      </div>
      
      <div className="p-4 space-y-4">
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
