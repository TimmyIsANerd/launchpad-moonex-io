# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project commands
- Install deps (no lockfile present, examples use npm):
  - npm install
- Development server (Next.js):
  - npm run dev
- Production build:
  - npm run build
- Start production server (after build):
  - npm run start
- Lint (Next.js built-in ESLint):
  - npm run lint
  - Auto-fix where possible:
    - npm run lint -- --fix
- Tests: no test framework or scripts are configured in this repo at present.

High-level architecture
- Framework/runtime
  - Next.js 14 App Router project using TypeScript and Tailwind CSS v4.
  - PostCSS configured with @tailwindcss/postcss (see postcss.config.mjs). Tailwind theming and tokens are defined directly in app/globals.css (Tailwind v4 “configless” approach) with CSS variables for MoonEx brand colors and radii.
  - Path alias @/* maps to repo root (see tsconfig.json paths), used across components and pages.

- Entry and providers
  - app/layout.tsx defines global HTML, applies Geist fonts, and wraps all pages with:
    - WalletProvider (components/wallet-provider.tsx) – a lightweight React context simulating wallet state (connect/disconnect, balances, network flag). No on-chain libs are used; this is a UI stub.
    - Suspense with PageLoading fallback (components/page-loading.tsx).
    - PageTransition (components/page-transition.tsx) for route transition animations.
    - @vercel/analytics Analytics component.
  - next.config.mjs disables type-check and lint failures during builds (typescript.ignoreBuildErrors and eslint.ignoreDuringBuilds). Images are unoptimized.

- Routing (App Router)
  - app/page.tsx – landing/dashboard: Navbar, TradingMarquee, EnhancedTokenTable with sample token data, and a CTA section.
  - app/ranking/page.tsx – rankings view: toggles between market cap and 24h volume sample tables.
  - app/advanced/page.tsx – advanced explorer: category tabs, MEV protection toggle (UI only), quick buy widget.
  - app/create-token/page.tsx – token creation form: validates basic fields client-side and gates submission on wallet connection (via WalletProvider). Includes FileUpload UI.
  - app/token/[tokenAddress]/page.tsx – token detail route: uses a local getTokenData stub, renders PriceChart, TradesComments, HoldersTable, and BuySellPanel. Also shows a BondingCurveProgress widget (UI-only values).

- UI system and shared libs
  - components/ui/* – small, composable primitives (Button, Card, Input, Label, etc.) built with class-variance-authority (CVA), Radix primitives where applicable, and a cn class merger (lib/utils.ts).
  - Styling is Tailwind-first; globals.css defines brand tokens via CSS variables and adds utility layers (e.g., gradient-cosmic, glow-*).
  - Animations centralized in lib/animations.ts (fadeIn, slideUp, buttonPress, buttonGlow, staggerContainer, spinnerRotate, etc.). Components import and reuse these for consistency (Navbar, WalletConnectModal, EnhancedTokenTable, HoldersTable, BuySellPanel, Footer, Page* components).
  - Charts with recharts (components/price-chart.tsx). Data is locally simulated for demo purposes.

- State and data
  - State is local React state plus a custom wallet React context (no Redux/Zustand). Most data across pages/components is mocked/sample data; there are no API calls or blockchain SDK integrations yet.

- Assets and styling
  - Public assets under public/ (e.g., images/moonex-hero.png, logos). Next Image optimization is disabled; components use plain img or background images.

What’s not present
- No README.md, CLAUDE.md, Cursor rules, or Copilot instruction files were found.
- No Jest/Vitest/Playwright/Cypress setup or scripts.
- No ESLint/Prettier config files are present; linting runs via Next’s defaults and is not enforced at build time due to next.config.mjs.
