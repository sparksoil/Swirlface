# Landing Page — Acceptance (Palette + Interaction)

## Must Pass (visual)
- Background uses **paper + rings**: paper = `--paper-100`, rings glow use only `--ring-mint`, `--ring-peach`, `--ring-sky`.  
- Central spiral art = **assets/spiral-sprout.svg**; stroke color = `--swirl-stroke`; not the JS-drawn path.
- Tokens (Family/Self/Work/RRR/Spiritual) use the **cup palette**:
  - divine = `--p-divine`, family = `--p-family`, self = `--p-self`, rrr = `--p-rrr`, work = `--p-work`.
- Toolbar is **secondary**: small, translucent; crumb input visible; no duplicated “Swirlface”.

## Must Pass (interaction)
- Tapping the **bright center** (Enter Day hotspot) navigates to `day.html`.  
- Typing in the **crumb box** and pressing **Enter** saves a crumb and flashes “Saved! Drop another…”.  
- Tapping any **token** routes to `swirlfeed.html#<pillar>`.  
- Helper card dismiss (×) hides it and **stays hidden** via localStorage.

## Token Audit (no hardcoding)
- Search the repo for `#` hex or `hsl(` inside `css/` — any non-palette color must be removed or replaced with tokens.  
- Confirm `/design/palette.css` is imported **first** and no file overrides the tokens with new values.

## Accessibility
- Spiral hotspot has a visible **focus ring** and `aria-label="Enter Day"`.  
- Toolbar controls have `aria-pressed` toggling correctly on mode buttons.
