import { Clock, DollarSign, ShoppingCart } from "lucide-react";

const ProblemSection = () => {
  return (
    <section className="py-16 bg-background">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
            Comparing grocery prices is difficult
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Price Confusion */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-destructive/10 rounded-full">
              <DollarSign className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              Price Confusion
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Shoppers struggle to compare prices across multiple stores, 
              missing out on significant savings and optimal deals.
            </p>
          </div>

          {/* Time Wasting */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-destructive/10 rounded-full">
              <Clock className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              Time Wasting
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Traditional shopping methods are inefficient, causing people 
              to spend hours comparing prices manually across different stores.
            </p>
          </div>

          {/* Budget Overruns */}
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-destructive/10 rounded-full">
              <ShoppingCart className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">
              Budget Overruns
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Without proper price comparison tools, families consistently 
              overspend on groceries and exceed their monthly budgets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
