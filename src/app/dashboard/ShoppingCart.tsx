"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  category: string;
  store: string;
  inStock: boolean;
  quantity: number;
  image?: string;
}

interface ShoppingCartProps {
  cartItems: CartItem[];
  onCheckout?: () => void;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({ 
  cartItems, 
  onCheckout 
}) => {
  const getProductEmoji = (name: string) => {
    if (name.includes('Banana')) return '🍌';
    if (name.includes('Milk')) return '🥛';
    if (name.includes('Bread')) return '🍞';
    return '🛒';
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.0875; // 8.75% tax
  const total = subtotal + tax;

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
              <div key={item.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                <div className="w-10 h-10 bg-muted/30 rounded flex items-center justify-center">
                  <span className="text-lg">
                    {getProductEmoji(item.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <div className="text-sm font-medium text-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            {/* Cart Summary */}
            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (8.75%):</span>
                <span className="text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
                <span className="text-foreground">Total:</span>
                <span className="text-foreground">${total.toFixed(2)}</span>
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
