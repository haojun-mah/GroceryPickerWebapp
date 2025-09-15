import { Search, Zap, TrendingUp } from "lucide-react";
import Image from "next/image";

const HowItWorksSection = () => {
  return (
    <section className="py-16 ">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Just 3 steps to get started
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Search className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-foreground">1. Search Your Items</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                    Search groceries we will recommend you the groceries from cheapest to most expensive. 
                  
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-foreground">2. Compare Instantly</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Our smart algorithms automatically process and compare prices 
                  across different retailers, showing you the best deals and 
                  potential savings in real-time.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-foreground">3. Save Money</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Get personalized shopping recommendations and create optimized 
                  shopping lists. Track your savings and make data-driven decisions 
                  to reduce your grocery expenses.
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="lg:pl-8">
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-destructive rounded-full"></div>
                  <div className="w-3 h-3 bg-warning rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                  <span className="text-sm text-muted-foreground ml-2">GroceryPicker Dashboard</span>
                </div>
                
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Search for groceries...</span>
                    </div>
                  </div>
                  
                  {/* Sample Results */}
                  <div className="space-y-2">
                    <div className="bg-background rounded-lg p-3 border border-border flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">Organic Bananas (1kg)</p>
                        <p className="text-xs text-muted-foreground">FreshMart</p>
                      </div>
                      <span className="text-sm font-bold text-success">$3.99</span>
                    </div>
                    
                    <div className="bg-background rounded-lg p-3 border border-border flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">Organic Bananas (1kg)</p>
                        <p className="text-xs text-muted-foreground">SuperSave</p>
                      </div>
                      <span className="text-sm font-bold text-primary">$4.25</span>
                    </div>
                    
                    <div className="bg-success/10 rounded-lg p-3 border border-success/20 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">Organic Bananas (1kg)</p>
                        <p className="text-xs text-success">BestBuy Groceries - Best Deal!</p>
                      </div>
                      <span className="text-sm font-bold text-success">$3.49</span>
                    </div>
                  </div>
                  
                  {/* Savings Badge */}
                  <div className="bg-success/10 rounded-lg p-3 text-center border border-success/20">
                    <p className="text-sm font-medium text-success">💰 You could save $0.50 with this choice!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
