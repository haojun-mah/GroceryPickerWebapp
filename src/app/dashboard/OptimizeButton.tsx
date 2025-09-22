"use client";

import React from "react";
import { BarChart3 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { GroceryItem } from "./SearchResults";

interface OptimizeButtonProps {
  item: GroceryItem;
  onOptimize: (item: GroceryItem) => void;
  onOptimizeResults?: (results: GroceryItem[]) => void;
  onOptimizeStart?: () => void;
}

const OptimizeButton: React.FC<OptimizeButtonProps> = ({ item, onOptimize, onOptimizeResults, onOptimizeStart }) => {

    const handleOptimize = async () => {
        try {
            // Trigger loading state
            if (onOptimizeStart) {
                onOptimizeStart();
            }
            
            // Call the original onOptimize function for any existing behavior
            onOptimize(item);
            
            // Fetch optimized results from the price-search API
            const response = await fetch('/api/optimize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: item.name }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch optimized results');
            }
            
            const data = await response.json();
            console.log('Optimization results:', data);
            
            // Convert API results to GroceryItem format
            if (data.results && data.results.length > 0 && onOptimizeResults) {
                const optimizedItems: GroceryItem[] = data.results.map((result: any) => ({
                    id: result.id,
                    name: result.name,
                    price: result.priceText || `$${result.price}`,
                    store: result.store,
                    quantity: result.quantity,
                    description: result.description,
                    imageUrl: result.imageUrl,
                    productUrl: result.productUrl,
                    promotion: result.promotion,
                    category: 'optimized',
                    inStock: true
                }));
                
                // Pass the optimized results back to update search results
                onOptimizeResults(optimizedItems);
            }
        } catch (error) {
            console.error('Error optimizing prices:', error);
            alert('Failed to optimize prices. Please try again.');
        }
    }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <button
          onClick={handleOptimize}
          className="p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
          aria-label={`Optimize prices for ${item.name}`}
        >
          <BarChart3 className="w-4 h-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">🔍 Price Optimization</h4>
          <p className="text-sm text-muted-foreground">
            Compare prices across all stores and find the best deals for{" "}
            <strong>{item.name}</strong>.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Search similar products across stores</div>
            <div>• Find bulk discount opportunities</div>
            <div>• List out alternative products that you can consider</div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default OptimizeButton;