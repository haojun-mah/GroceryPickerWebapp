# Color System Reference

This project uses a comprehensive color system that automatically adapts to light and dark modes.

## Available Color Classes

### Background Colors
- `bg-background` - Main background color
- `bg-foreground` - Main text color (inverse of background)
- `bg-card` - Card/component background
- `bg-popover` - Popover/dropdown background
- `bg-primary` - Primary brand color
- `bg-secondary` - Secondary background color
- `bg-muted` - Muted/subtle background
- `bg-accent` - Accent background color
- `bg-destructive` - Error/danger background
- `bg-success` - Success background
- `bg-warning` - Warning background
- `bg-info` - Information background

### Text Colors
- `text-foreground` - Main text color
- `text-background` - Text on background
- `text-card-foreground` - Text on cards
- `text-primary-foreground` - Text on primary backgrounds
- `text-secondary-foreground` - Text on secondary backgrounds
- `text-muted-foreground` - Muted/subtle text
- `text-accent-foreground` - Text on accent backgrounds
- `text-destructive-foreground` - Text on error/danger backgrounds
- `text-success-foreground` - Text on success backgrounds
- `text-warning-foreground` - Text on warning backgrounds
- `text-info-foreground` - Text on info backgrounds

### Border Colors
- `border-border` - Standard border color
- `border-input` - Input field borders
- `border-primary` - Primary colored borders
- `border-secondary` - Secondary colored borders
- `border-destructive` - Error/danger borders
- `border-success` - Success borders
- `border-warning` - Warning borders
- `border-info` - Information borders

### Ring Colors (for focus states)
- `ring-ring` - Standard focus ring
- `ring-primary` - Primary focus ring
- `ring-destructive` - Error focus ring

## Color Scheme

### Light Mode
- **Background**: Pure white with subtle grays for cards
- **Primary**: Modern blue (#3b82f6)
- **Text**: Dark charcoal for excellent readability
- **Borders**: Light gray (#e5e7eb)

### Dark Mode
- **Background**: Rich dark blue (#0f172a)
- **Primary**: Bright blue (#60a5fa)
- **Text**: Off-white for comfortable reading
- **Borders**: Subtle dark gray

## Usage Examples

```tsx
// Basic layout
<div className="bg-background text-foreground">
  <div className="bg-card border border-border rounded-lg p-4">
    <h2 className="text-card-foreground">Card Title</h2>
    <p className="text-muted-foreground">Subtitle text</p>
  </div>
</div>

// Primary button
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click Me
</button>

// Success message
<div className="bg-success text-success-foreground p-3 rounded">
  Operation successful!
</div>

// Warning message
<div className="bg-warning text-warning-foreground p-3 rounded">
  Please check your input
</div>
```

## Theme Toggle

Use the `ThemeToggle` component to switch between light and dark modes:

```tsx
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header className="bg-background border-b border-border">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-foreground">My App</h1>
        <ThemeToggle />
      </div>
    </header>
  )
}
```

## Setting Up Theme Provider

Wrap your app with the ThemeProvider in your layout:

```tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```
