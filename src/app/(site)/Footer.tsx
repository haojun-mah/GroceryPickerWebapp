export default function Footer() {
  return (
    <footer className="border-t border-border bg-card px-4 py-12 md:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src="/icon.png"
                alt="GroceryPicker Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-semibold text-foreground">
                GroceryPicker
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Efficient shopping made possible</p>
            <p className="text-sm text-muted-foreground">
              Copyright © 2025 - All rights reserved
            </p>
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
              🛒 Smart grocery comparison
            </div>
          </div>

          

          {/* Support Column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              🤝 Support
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="/help"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/feedback"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Newsletter Column */}
          <div>
            {/* Newsletter Section */}
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-muted-foreground">
                📩 Save More, Shop Smarter
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Get weekly deals & grocery saving tips!
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg bg-input px-3 py-2 text-sm text-foreground placeholder-muted-foreground outline-none ring-ring transition-shadow focus:ring-2"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          © 2025 GroceryPicker. All Rights Reserved. Built by{" "}
          <a
            href="https://github.com/haojun-mah"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Hao Jun Mah
          </a>
          .
        </div>
      </div>
    </footer>
  );
}
