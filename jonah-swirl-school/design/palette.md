# Sparksoil Swirlface — Design & Palette Reference

Purpose: keep design choices consistent during **Polish** tasks.  
Scope: background vibe, accent palette, and general layout rules.  
Always use CSS tokens where possible (`css/base.css`, `css/theme-sparksoil.css`).

---

## 1. Base Atmosphere (Backgrounds)
- **Swirl Neutral**: soft gradient backgrounds (peach/cream → blush).  
- **Texture**: faint spiral or concentric rings, very light opacity.  
- **Mood**: calm, gentle, grounding.  
- **Tokens**:  
  - `--paper` (light neutral surface)  
  - `--ink` (dark text)  
  - `--surface-strong` (card backgrounds)

---

## 2. Alive Accent Palette (Sprinkles)
Use accents to bring energy. Inspired by your paint photo:  

| Color | Usage | Notes |
|-------|-------|-------|
| **Orange / Coral** | Primary accent (buttons, highlights) | Warm, energetic |
| **Pink / Magenta** | Secondary accent | Playful, soft |
| **Yellow / Lemon** | Positive feedback, highlights | Bright, hopeful |
| **Sky Blue** | Links, hover glows | Clear, refreshing |
| **Green / Mint** | Pillar identity, success | Calm, natural |

---

## 3. Application Rules
- **Backgrounds** stay neutral swirl.  
- **Cards & surfaces**: soft shadow, rounded corners (`--radius`, 10–16px).  
- **Accents**: never all at once; use 1–2 colors per view as sprinkles.  
- **Text**: system-UI font stack, readable size, high contrast (`--ink` on `--paper`).  
- **Shadows**: subtle, layered for depth (`--shadow-strong`).  

---

## 4. Layout Reminders
- Rounded corners, airy spacing (12–16px padding).  
- Minimum tap targets: 44px.  
- Focus-visible outline = `--accent1` (mint) so accessibility feels on-brand.  
- Avoid heavy borders; use soft shadows or gradient rings (esp. for stories/avatars).

---

## 5. Acceptance (Design Polish)
When polishing, confirm:  
1. Swirl neutral base is always present.  
2. Alive palette used sparingly as sprinkles (not walls).  
3. Rounded cards, subtle shadows, airy spacing.  
4. Text clear and accessible.  
5. Overall vibe = **calm background + alive highlights**. 
