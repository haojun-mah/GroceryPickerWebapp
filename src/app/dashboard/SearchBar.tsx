"use client";

import React, { useRef } from "react";
import { Search, Bot, Clock, X } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery, 
  onSearch 
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchQuery(newValue);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };
  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Type what groceries you need... (e.g., 'I need bananas, milk, and bread for breakfast')"
            className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
          
          {/* Clear button */}
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button 
          onClick={onSearch}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Search
        </button>
      </div>
      
      {/* AI Features */}
      <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <span>AI-powered grocery search</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-success" />
          <span>Real-time pricing</span>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
