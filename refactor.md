1. General Structure and Layout
The card is a self-contained unit, likely implemented as a flex container to manage vertical and horizontal flow.

|

| Feature | Description | Implementation Detail (Inferred) |
| Container | A rounded, solid block with a subtle border and shadow. | div with bg-gray-800 (dark mode), rounded-xl, shadow-lg, and border border-gray-700. |
| Dimensions | Fixed width on desktop, full width on mobile. | Desktop: max-w-xs or fixed width within a grid layout (grid-cols-4 or similar). Mobile: w-full. |
| Padding | Consistent internal padding. | p-4 to p-6. |
| Interaction | The entire card is usually clickable or features hover states. | cursor-pointer, subtle hover:shadow-xl or hover:bg-gray-700/50 transition. |
| Layout | Information is organized in a clear top-to-bottom flow, with key data points aligned using internal flex or grid. | Outer container uses flex flex-col or grid for structure. |

2. Component Breakdown
The card can be segmented into three main logical areas: Header/Status, Pricing/Tidbits, and Detailed Information.

A. Header & Status Row
This row establishes the token's context and high-level identity. It uses flex for horizontal alignment (justify-between).

| Element | Content | Styling/Implementation |
| Status Tag | E.g., "Listed on PancakeSwap" or "Featured". | Small span tag. Text: text-xs, font-semibold. Background: Light blue/gray background (bg-blue-600/20 or bg-gray-600/20), with matching text color (text-blue-400). rounded-full for pill shape. |
| Token Logo | A small, distinctive icon/image for the token. | img or div. Fixed size, typically w-8 h-8 or w-10 h-10. Usually rounded-full. |
| Base Currency | The currency paired against (e.g., BNB, USD1, USDT). | Simple text label, often grayed out. text-xs font-medium text-gray-400. |

B. Pricing and Ticker Row
The most visually dominant section, emphasizing the current price momentum.

| Element | Content | Styling/Implementation |
| Token Ticker | The short symbol (e.g., PASTER, AMN). | Large, bold text for prominence. text-lg or text-xl, font-extrabold, text-white. |
| Price Change (%) | The 24h or recent price change. | CRITICAL: Conditional styling based on value. Green for positive (text-green-400, e.g., +114.1%). Red for negative (if applicable). text-lg font-bold. |

C. Detailed Information Block
This section provides narrative and fundamental data, separated from the top with vertical spacing (mt-2 or space-y-2).

| Element | Content | Styling/Implementation |
| Full Name/Title | The descriptive name (e.g., "The Aster Pastor"). | text-base or text-lg, font-semibold, text-white. |
| Category/Tag | The type (e.g., "Meme", "AI", "Games"). | Small pill tag, similar to the Status Tag but perhaps a different color (e.g., bg-purple-600/20, text-purple-400). rounded-full, px-2 py-0.5, text-xs. |
| Description/Narrative | A brief one or two-line text about the project. | text-sm, text-gray-400. Ellipsis handling (truncate or max lines) is crucial here to prevent card height inconsistency. |
| Creator Address | "created by: 0x..." | Very small text, muted color. text-xs, text-gray-500. The address itself is usually truncated (0x95...86b76a). |
| Market Cap | Label + Value (e.g., "Market Cap: 12.66K"). | Key-value pair, often displayed using a grid or flex to keep labels and values aligned. text-sm font-medium, text-gray-300. |

3. Styling and Visual Aesthetics
The overall aesthetic is modern, dark-themed, and emphasizes data clarity.
styling should match the brand.md file present in the root directory

4. Responsiveness
The card is designed to seamlessly integrate into the grid layout and handle various screen sizes.

Grid Integration: The cards are displayed within a responsive grid container (grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4).

Mobile Behavior: On smaller screens, the card switches to full width (w-full) and stacks vertically. The internal elements maintain their proportions and alignment within the now wider card.

Typography Scaling: While subtle, some larger font sizes (text-xl) may scale down slightly on mobile to maintain visual balance.