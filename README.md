# buky-brandkit

Apply the **Buky / Butake** brand identity to an app project, and switch app icons
remotely. Works as a **Claude Code skill** (`SKILL.md`) and as plain Node scripts.

## What it does

1. **Detects the stack** — KMP / Compose Multiplatform, native iOS, native Android.
2. **Generates a 3-layer icon system** per product (background color + symbol foreground
   + monochrome layer), framed in the safe zone so it survives every OS treatment
   (iOS squircle / dark / tinted / Liquid Glass, Android adaptive + themed, web).
3. **Installs** the assets into the right place for the detected stack.
4. **Scaffolds remote icon switching** driven by Firebase Remote Config.

## The honest constraint

You **cannot** push a brand-new icon image to an installed app over the air. iOS and
Play Store don't allow it. What you *can* do — and what this kit sets up — is **bundle a
set of alternate icons at build time** and let a **remote config pick which one is active**
(like seasonal icons). Switching among bundled themes is remote and instant; adding a new
theme needs an app update. See `references/remote-switching.md`.

## Quick start

```bash
npm install
node scripts/detect-stack.mjs /path/to/your/app
node scripts/generate-icons.mjs --config brand.config.json --out out/icons
# then follow references/<stack>.md to install + wire remote switching
```

## Add a product or theme

Edit `brand.config.json`. A product is one entry (its background color is the whole
distinctive); a theme is one entry. Everything else is derived.

## Layout

- `SKILL.md` — Claude Code skill instructions
- `brand.config.json` — products, themes, framing
- `scripts/` — `detect-stack.mjs`, `generate-icons.mjs`, `install/*`, `lib/symbol.mjs`
- `integration/` — KMP `IconManager` (expect/actual) + Firebase client; native iOS/Android
- `references/` — per-stack install guides + the icon-system + remote-switching docs

MIT © Butake
