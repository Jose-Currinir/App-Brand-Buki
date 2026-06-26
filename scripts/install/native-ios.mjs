#!/usr/bin/env node
// Install the primary AppIcon into an iOS asset catalog; stage alternates as loose PNGs.
// Usage: node scripts/install/native-ios.mjs <ios-dir> <out/icons> [productKey=buky]
import { cpSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const [iosDir, iconsDir, product = 'buky'] = process.argv.slice(2);
if (!iosDir || !iconsDir) { console.error('usage: native-ios.mjs <ios-dir> <out/icons> [product]'); process.exit(1); }

const store = join(iconsDir, product, 'ios', 'AppStore-1024.png');
if (!existsSync(store)) { console.error(`No generated iOS icon at ${store}. Run generate-icons.mjs first.`); process.exit(1); }

// find an .xcassets; else create AppIcon.appiconset next to the ios dir
let xcassets = null;
const stack = [iosDir];
while (stack.length) {
  const d = stack.pop();
  for (const e of readdirSync(d, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name.endsWith('.xcassets')) { xcassets = join(d, e.name); stack.length = 0; break; }
      if (!['build', 'Pods', '.git'].includes(e.name)) stack.push(join(d, e.name));
    }
  }
}
xcassets = xcassets || join(iosDir, 'Assets.xcassets');
const appicon = join(xcassets, 'AppIcon.appiconset');
mkdirSync(appicon, { recursive: true });
cpSync(store, join(appicon, 'AppStore-1024.png'));
writeFileSync(join(appicon, 'Contents.json'), JSON.stringify({
  images: [{ filename: 'AppStore-1024.png', idiom: 'universal', platform: 'ios', size: '1024x1024' }],
  info: { author: 'brandkit', version: 1 },
}, null, 2));

console.log(`✓ Primary AppIcon written to ${appicon}`);
console.log('→ STUB (do in Xcode): add the alternate PNGs as LOOSE bundle files (not in xcassets):');
console.log('  pride@2x.png/@3x.png, halloween@2x/@3x, holiday@2x/@3x — render them from the layers.');
console.log('  Then merge integration/ios/Info-AlternateIcons.plist into Info.plist and add AlternateIcons.swift.');
