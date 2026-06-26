#!/usr/bin/env node
// Install generated Android assets into a module's res/ and write the adaptive manifest.
// Usage: node scripts/install/native-android.mjs <module-dir> <out/icons> [productKey=buky]
import { cpSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const [moduleDir, iconsDir, product = 'buky'] = process.argv.slice(2);
if (!moduleDir || !iconsDir) { console.error('usage: native-android.mjs <module-dir> <out/icons> [product]'); process.exit(1); }

const src = join(iconsDir, product, 'android');
const res = join(moduleDir, 'src', 'main', 'res');
if (!existsSync(src)) { console.error(`No generated Android assets at ${src}. Run generate-icons.mjs first.`); process.exit(1); }
mkdirSync(res, { recursive: true });

const DENS = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
for (const d of DENS) {
  const from = join(src, `mipmap-${d}`);
  if (existsSync(from)) cpSync(from, join(res, `mipmap-${d}`), { recursive: true });
}

// adaptive layers as xxxhdpi mipmaps referenced by the anydpi xml
mkdirSync(join(res, 'mipmap-xxxhdpi'), { recursive: true });
for (const f of ['ic_launcher_foreground.png', 'ic_launcher_background.png', 'ic_launcher_monochrome.png']) {
  if (existsSync(join(src, f))) cpSync(join(src, f), join(res, 'mipmap-xxxhdpi', f));
}

const anydpi = join(res, 'mipmap-anydpi-v26');
mkdirSync(anydpi, { recursive: true });
const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome" />
</adaptive-icon>
`;
writeFileSync(join(anydpi, 'ic_launcher.xml'), xml);
writeFileSync(join(anydpi, 'ic_launcher_round.xml'), xml);

console.log(`✓ Android assets installed into ${res}`);
console.log('→ Next: merge integration/android/activity_aliases.xml into AndroidManifest.xml,');
console.log('  add IconManager.android.kt, and set BrandKitInit.app in Application.onCreate().');
