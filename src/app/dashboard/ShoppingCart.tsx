"use client";

import React from "react";
import { ShoppingCart, X } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  category: string;
  store: string;
  inStock: boolean;
  quantity: number;
  image?: string;
}

interface ShoppingCartProps {
  cartItems: CartItem[];
  onCheckout?: () => void;
  onRemoveItem?: (itemId: string) => void;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({ 
  cartItems, 
  onCheckout,
  onRemoveItem 
}) => {
  const getProductEmoji = (name: string) => {
    if (name.includes('Banana')) return '🍌';
    if (name.includes('Milk')) return '🥛';
    if (name.includes('Bread')) return '🍞';
    return '🛒';
  };

  // Parse price string to number for calculations
  const parsePrice = (priceString: string): number => {
    return parseFloat(priceString.replace('$', ''));
  };

  // Format number back to price string
  const formatPrice = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0);
  const total = subtotal;

  return (
    <div className="bg-card rounded-lg border border-border sticky top-4">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Shopping Cart</h2>
          <span className="text-sm text-primary font-medium">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground mt-1">Start adding items to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Cart Items */}
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-background rounded-lg group">
                <div className="w-12 h-12 bg-muted/30 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        // Fallback to emoji if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-lg">${getProductEmoji(item.name)}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-lg">
                      {getProductEmoji(item.name)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  <p className="text-xs text-muted-foreground">{item.store}</p>
                </div>
                <div className="text-sm font-medium text-foreground">
                  {formatPrice(parsePrice(item.price) * item.quantity)}
                </div>
                {onRemoveItem && (
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-destructive/10 rounded-full text-muted-foreground hover:text-destructive"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            {/* Cart Summary */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground">{formatPrice(total)}</span>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button 
              onClick={onCheckout}
              className="w-full py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCartComponent;
