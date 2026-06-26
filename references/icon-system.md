# The 3-layer icon system

Every product icon is derived from three reusable layers. This is what makes one design
survive every OS treatment (iOS squircle / dark / tinted / Liquid Glass, Android adaptive +
themed, web favicon + maskable) without anything getting clipped.

| Layer | File | Transparent? | Feeds |
|-------|------|--------------|-------|
| Background | `bg.svg` / `bg-dark.svg` | no (full-bleed) | iOS bg, Android `<background>`, web, store icons |
| Foreground | `fg.svg` (symbol) | yes | iOS fg, Android `<foreground>`, all masks |
| Monochrome | `mono.svg` (silhouette) | yes | Android 13+ themed, iOS tinted, Safari pinned tab, notifications |

## Rules that keep it compatible

- **Full-bleed background, no baked corners.** The OS rounds/masks. Don't add your own
  rounded rect to the background layer or it double-rounds.
- **No baked effects.** No shadows, gradients, or glass — the OS adds those (Liquid Glass).
  Flat layers only.
- **Symbol lives in the safe zone.** Framed at `safeZone` (default **0.56** of the canvas
  longest side), centered on the symbol's real ink bounding box — not the SVG viewBox, which
  is off-center. 0.56 fits inside the Android adaptive safe circle (~66dp of 108dp) and the
  iOS squircle simultaneously, so the "B" is never cut by any mask.
- **One token per product.** The background color is the entire per-product distinctive. The
  flagship app keeps forest bg + mint symbol; products use a color bg + white symbol.

## Why bbox-centering matters

The Butake symbol's ink is not centered in its 810×810 viewBox (it's slightly off and nearly
full-height). Centering the viewBox makes the mark look shifted and lets it touch edges.
`lib/symbol.mjs` centers on the measured ink center `(401.13, 404.22)` instead, so margins
are even at every size.
