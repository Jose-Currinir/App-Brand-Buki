#!/usr/bin/env node
// Install into a KMP project: Android side fully, iOS side staged.
// Usage: node scripts/install/kmp.mjs <target-project-dir> <out/icons> [productKey=buky]
import { existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const [target, iconsDir, product = 'buky'] = process.argv.slice(2);
if (!target || !iconsDir) { console.error('usage: kmp.mjs <target-project-dir> <out/icons> [product]'); process.exit(1); }
const here = dirname(fileURLToPath(import.meta.url));

function findDir(root, test, max = 4, depth = 0) {
  if (depth > max) return null;
  for (const e of readdirSync(root, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (['node_modules', '.git', 'build', '.gradle'].includes(e.name)) continue;
    const p = join(root, e.name);
    if (test(p, e.name)) return p;
    const found = findDir(p, test, max, depth + 1);
    if (found) return found;
  }
  return null;
}

// Android module = a dir containing src/main/AndroidManifest.xml
const androidModule = findDir(target, (p) => existsSync(join(p, 'src', 'main', 'AndroidManifest.xml')));
// iOS dir = a dir containing a .xcodeproj
const iosDir = findDir(target, (p) => readdirSync(p).some((n) => n.endsWith('.xcodeproj')));

if (androidModule) {
  console.log(`Android module: ${androidModule}`);
  spawnSync('node', [join(here, 'native-android.mjs'), androidModule, iconsDir, product], { stdio: 'inherit' });
} else console.log('! No Android module found (src/main/AndroidManifest.xml).');

if (iosDir) {
  console.log(`iOS dir: ${iosDir}`);
  spawnSync('node', [join(here, 'native-ios.mjs'), iosDir, iconsDir, product], { stdio: 'inherit' });
} else console.log('! No iOS project found (*.xcodeproj).');

console.log('→ Remote switching: copy integration/kmp/* into commonMain/androidMain/iosMain and adjust the package.');
