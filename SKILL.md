---
name: brandkit
description: >-
  Apply the Buky/Butake brand identity (logo + per-product layered app-icon system)
  to a target app project, and scaffold remote icon switching. Use this skill whenever
  the user wants to set up, generate, install, or update app icons / launcher icons /
  favicons for a Buky app, brand a new product in the family, add a seasonal or themed
  icon (pride, halloween, holiday…), or wire up changing the app icon remotely from a
  manager/dashboard. Trigger it even if the user doesn't say "brandkit" — phrases like
  "ponle el icono a esta app", "generá los iconos para iOS/Android", "agregá Buky GPS",
  "quiero cambiar el icono de temporada desde Firebase", or "detectá qué stack es y
  brandéalo" should all use this skill. Supports KMP / Compose Multiplatform and native
  iOS + Android.
---

# brandkit — Buky/Butake brand application

This skill takes a brand definition (`brand.config.json`) and applies it to a target
project: it detects the stack, generates a 3-layer app-icon system, installs the assets
in the right place for that stack, and scaffolds remote (config-driven) icon switching.

## The one constraint to be honest about

You **cannot** push an arbitrary new icon image to an already-installed app over the air —
iOS and Play Store don't allow it and the APIs don't exist. What you CAN do, and what this
skill sets up, is **bundle a set of alternate icons at build time** and let a **remote
config (Firebase Remote Config)** choose which one is *active*. The app reads the config and
calls the native switch API. So: switching among existing themes is remote and instant;
adding a *new* theme still requires an app update. Always state this plainly to the user —
never imply OTA image delivery is possible.

## Workflow

Run these steps in order. Confirm with the user between detection and writing files.

### 1. Detect the stack
```
node scripts/detect-stack.mjs <target-project-dir>
```
Prints JSON: `{ stack, supported, evidence[], targets: {ios, android, web} }`.
- `kmp` — Kotlin Multiplatform / Compose Multiplatform (a module applies the multiplatform
  plugin; usually has `androidApp` + `iosApp`).
- `native-ios` — has `*.xcodeproj`/`Package.swift`, no multiplatform plugin.
- `native-android` — has `AndroidManifest.xml`, no multiplatform plugin.
- If `supported` is false, tell the user which stacks are covered and stop. Don't guess.

### 2. Generate the icon assets
```
node scripts/generate-icons.mjs --config brand.config.json --out out/icons
```
Produces, per product, the **3 reusable layers** (`bg`, `bg-dark`, `fg`, `mono`) and the
derived platform assets. The symbol is centered on its real ink bounding box and framed at
`safeZone` (default 0.56 of the canvas) so it survives every OS mask, Liquid Glass, and
themed tint. See `references/icon-system.md` for the layer model and why 0.56.

### 3. Install into the project
Pick the installer for the detected stack and read its reference first:
- `kmp` → read `references/kmp.md`, then `node scripts/install/kmp.mjs <target> out/icons`
- `native-ios` → read `references/native-ios.md`, then `scripts/install/native-ios.mjs`
- `native-android` → read `references/native-android.md`, then `scripts/install/native-android.mjs`

Installers copy assets and (for adaptive/alternate icons) write the platform manifests
(`mipmap-anydpi-v26/*.xml`, `<activity-alias>` entries, `CFBundleAlternateIcons`).

### 4. Scaffold remote switching
Read `references/remote-switching.md`. Copy the integration templates and adapt package
names:
- KMP: `integration/kmp/` — `IconManager` (expect) + `.android.kt`/`.ios.kt` actuals +
  `RemoteThemeClient` (Firebase Remote Config).
- native: `integration/ios/` and `integration/android/`.
Anything requiring a paid Apple Developer account or hosting is marked `// STUB:` — leave it
stubbed and tell the user what they need to provision.

## Brand definition

`brand.config.json` holds the symbol path data, the product list (each with its accent
color), the theme set, and framing options. To **add a product** (e.g. `Buky Sueño`), add an
entry to `products`; to **add a theme** (e.g. halloween), add to `themes`. Everything else is
derived — one color token per product is the whole job. Brand constants: company **Butake**,
app family **Buky**, primary Vital Green `#00E091`, Forest Ink `#0F2922`, font Plus Jakarta
Sans, UI icon set Phosphor.

## Dependencies
Node 18+ and `sharp` (`npm install` in this repo). `sharp` renders the SVG layers to PNG at
each platform size.
