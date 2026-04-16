# Guallet Copilot Instructions

## Design Context

### Users
Mildly tech-savvy individuals who want meaningful control over their personal finances. They use a budgeting app regularly — checking balances, reviewing transactions, tracking spending patterns. They're comfortable with technology but not necessarily developers. They open Guallet on a weekday morning with coffee, or in the evening after paying bills. The product is self-hosted, so there's an implied trust relationship: this person chose to run their own instance.

### Brand Personality
**Three words:** methodical, unhurried, trustworthy

The interface should feel like a quiet expert — confident without being loud, structured without being cold. No urgency. No marketing pressure. Just clear, reliable information delivered with precision.

**Emotional goals:** Calm control + sharp clarity. Users should feel *in command* when they look at their data — not overwhelmed, not anxious. Numbers should be legible and contextual. The UI chrome should recede so the financial content is the hero.

### Aesthetic Direction
**Theme:** Light mode. Warm off-white surfaces, not clinical white.

**Visual reference:** Coinbase — clean confidence, restrained palette, strong typographic hierarchy, generous negative space, financial-grade seriousness without stuffiness.

**Typography:**
- Headings/display: **Epilogue** (Google Fonts)
- UI text and body: **Figtree** (Google Fonts)
- `font-variant-numeric: tabular-nums` required everywhere financial data appears

**Palette:**
- Base: warm off-white surfaces tinted slightly toward brand blue — not pure white
- Neutrals: stone-warm greys with a subtle blue tint
- Primary accent: deep blue (#005EB8) used sparingly — active states, CTAs, key data only
- Negative amounts: muted terracotta/rust
- Positive amounts: muted sage green

### Design Principles

1. **Data is the hero.** UI exists to frame financial information, not compete with it.
2. **Calm before clarity.** If a layout feels busy, simplify first. Unhurried pacing comes before dense hierarchy.
3. **Trustworthy restraint.** One accent color, used rarely. No decorative gradients. No sparklines for decoration.
4. **Deliberate hierarchy.** Typography and spacing do the heavy lifting — not color, not shadows, not borders.
5. **Adaptive without amputating.** On smaller screens, adapt the layout — never hide financial data.
