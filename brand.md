# MoonEx Brand Guide

This document summarizes the brand colors and UI effects currently used by the MoonEx frontend.

Source of truth:
- Global stylesheet: `app/globals.css` (imported by `app/layout.tsx`)
- Utility classes and gradients: defined in `app/globals.css` under `@layer utilities`

A secondary file `styles/globals.css` exists with an OKLCH palette, but it is not imported and therefore not active.

## Color Palette

- **Primary**: `#00c0ff`
  - Variables: `--primary`, `--sidebar-primary`, `--ring: rgba(0, 192, 255, 0.5)`
  - Usage: Primary actions, highlights, focus rings, glow accents

- **Secondary / Accent**: `#ff00a0`
  - Variables: `--secondary`, `--accent`, `--sidebar-accent`
  - Usage: Secondary actions, accent highlights, glow accents

- **Background (Base)**: `#0d0d0d`
  - Variable: `--background`
  - Usage: App/page backgrounds

- **Foreground (Text)**: `#ffffff`
  - Variable: `--foreground`
  - Usage: Primary text color on dark backgrounds

- **Card / Popover Background**: `#1a1a1a`
  - Variables: `--card`, `--popover`
  - Usage: Surfaces such as cards and popovers

- **Muted Text**: `#6b7280`
  - Variable: `--muted`
  - Usage: Subtle supporting text

- **Border**: `#4b5563`
  - Variable: `--border`
  - Usage: Borders for inputs, cards, and separators

- **Destructive**: `#e3342f`
  - Variable: `--destructive`
  - Usage: Destructive actions and critical states

- **Input Background**: `#1a1a1a`
  - Variable: `--input`

- **Focus Ring**: `rgba(0, 192, 255, 0.5)`
  - Variable: `--ring`

- **Sidebar Variants**
  - `--sidebar`: `#0d0d0d`
  - `--sidebar-foreground`: `#ffffff`
  - `--sidebar-primary`: `#00c0ff`
  - `--sidebar-primary-foreground`: `#ffffff`
  - `--sidebar-accent`: `#ff00a0`
  - `--sidebar-accent-foreground`: `#ffffff`
  - `--sidebar-border`: `#4b5563`
  - `--sidebar-ring`: `rgba(0, 192, 255, 0.5)`

## Gradients & Effects

- **Cosmic Gradient (text)**
  - CSS: `linear-gradient(135deg, #00c0ff 0%, #ff00a0 100%)`
  - Fallback color: `#00c0ff`
  - Utility class: `.gradient-cosmic`

- **Lunar Gradient (background)**
  - CSS: `linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #2d2d2d 100%)`
  - Utility class: `.gradient-lunar`

- **Video Frame Gradient**
  - CSS: `linear-gradient(145deg, #2d3748 0%, #1a202c 100%)`
  - Utility class: `.video-phone-frame`

- **Glow Effects**
  - Cyan glow (box-shadow): `0 0 20px rgba(0, 192, 255, 0.3)`
    - Utility class: `.glow-cyan`
  - Pink glow (box-shadow): `0 0 20px rgba(255, 0, 160, 0.3)`
    - Utility class: `.glow-pink`
  - Text glow (cyan): `0 0 10px rgba(0, 192, 255, 0.5)`
    - Utility class: `.text-glow-cyan`
  - Text glow (pink): `0 0 10px rgba(255, 0, 160, 0.5)`
    - Utility class: `.text-glow-pink`

## CSS Variables (root)

Defined in `:root` and mirrored in `.dark` in `app/globals.css`:

```
--background: #0d0d0d;
--foreground: #ffffff;
--card: #1a1a1a;
--card-foreground: #ffffff;
--popover: #1a1a1a;
--popover-foreground: #ffffff;
--primary: #00c0ff;
--primary-foreground: #ffffff;
--secondary: #ff00a0;
--secondary-foreground: #ffffff;
--muted: #6b7280;
--muted-foreground: #ffffff;
--accent: #ff00a0;
--accent-foreground: #ffffff;
--destructive: #e3342f;
--destructive-foreground: #ffffff;
--border: #4b5563;
--input: #1a1a1a;
--ring: rgba(0, 192, 255, 0.5);
--radius: 0.5rem;
--sidebar: #0d0d0d;
--sidebar-foreground: #ffffff;
--sidebar-primary: #00c0ff;
--sidebar-primary-foreground: #ffffff;
--sidebar-accent: #ff00a0;
--sidebar-accent-foreground: #ffffff;
--sidebar-border: #4b5563;
--sidebar-ring: rgba(0, 192, 255, 0.5);
```

## Usage Examples

- **Tailwind (via CSS variables mapped in `@theme inline`)**
  - Background: `bg-background`
  - Text: `text-foreground`
  - Primary text: `text-primary`
  - Primary surface: `bg-primary`
  - Accent text: `text-secondary` / `text-accent`
  - Borders: `border-border`

- **Utility classes**
  - Text gradient: `gradient-cosmic`
  - Background gradient: `gradient-lunar`
  - Glows: `glow-cyan`, `glow-pink`, `text-glow-cyan`, `text-glow-pink`

- **Raw CSS usage**

```css
.myButton {
  background: var(--primary);
  color: var(--primary-foreground);
  box-shadow: 0 0 20px rgba(0, 192, 255, 0.3);
}

.card {
  background: var(--card);
  border: 1px solid var(--border);
}
```

## Accessibility Notes

- Ensure sufficient contrast when placing text over gradients; `.gradient-cosmic` includes a `#00c0ff` text fallback for accessibility.
- Primary and secondary foreground variables are set to `#ffffff` against dark backgrounds for contrast.

## Dark Mode

- The app runs with `<html class="dark">` in `app/layout.tsx`, using the same cosmic palette for dark mode.
