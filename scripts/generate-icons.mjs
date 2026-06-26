#!/usr/bin/env node
// Generate the 3-layer icon system + derived platform assets from brand.config.json.
// Usage: node scripts/generate-icons.mjs --config brand.config.json --out out/icons
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { placed, svg, symbol } from './lib/symbol.mjs';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith('--') ? [...a, [v.slice(2), arr[i + 1]]] : a), [])
);
const here = dirname(fileURLToPath(import.meta.url));
const cfg = JSON.parse(readFileSync(args.config || join(here, '..', 'brand.config.json'), 'utf8'));
const OUT = args.out || join(here, '..', 'out', 'icons');
const SAFE = cfg.safeZone ?? 0.56;
const RAD = cfg.radiusPct ?? 0.2235;

let sharp;
try { ({ default: sharp } = await import('sharp')); }
catch { console.error('Missing dependency "sharp". Run `npm install` in the brandkit repo first.'); process.exit(1); }

function w(rel, c) { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, c); }
async function rp(rel, s) { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); await sharp(Buffer.from(s)).png().toFile(p); }

const DENS = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const tasks = [];

for (const p of cfg.products) {
  const k = p.key;
  // --- 3 reusable master layers (SVG, scalable) ---
  w(`${k}/layers/bg.svg`,      svg(1024, `<rect width="1024" height="1024" fill="${p.bg}"/>`));
  w(`${k}/layers/bg-dark.svg`, svg(1024, `<rect width="1024" height="1024" fill="${p.bgDark || p.bg}"/>`));
  w(`${k}/layers/fg.svg`,      svg(1024, placed(1024, p.fg, SAFE)));
  w(`${k}/layers/mono.svg`,    svg(1024, placed(1024, '#000000', SAFE)));

  // --- iOS: opaque AppStore icon (no alpha) light + dark ---
  const composite = (bg, size) => svg(size, `<rect width="${size}" height="${size}" fill="${bg}"/>${placed(size, p.fg, SAFE)}`);
  tasks.push(rp(`${k}/ios/AppStore-1024.png`, composite(p.bg, 1024)).then(() => flattenLast(`${k}/ios/AppStore-1024.png`, p.bg)));
  tasks.push(rp(`${k}/ios/AppStore-dark-1024.png`, composite(p.bgDark || p.bg, 1024)));

  // --- Android: adaptive layers + legacy mipmaps + play store ---
  tasks.push(rp(`${k}/android/ic_launcher_background.png`, svg(432, `<rect width="432" height="432" fill="${p.bg}"/>`)));
  tasks.push(rp(`${k}/android/ic_launcher_foreground.png`, svg(432, placed(432, p.fg, SAFE))));
  tasks.push(rp(`${k}/android/ic_launcher_monochrome.png`, svg(432, placed(432, '#000000', SAFE))));
  tasks.push(rp(`${k}/android/playstore-512.png`, composite(p.bg, 512)));
  for (const [d, s] of Object.entries(DENS)) {
    tasks.push(rp(`${k}/android/mipmap-${d}/ic_launcher.png`, svg(s, `<rect width="${s}" height="${s}" rx="${(s * 0.16).toFixed(1)}" fill="${p.bg}"/>${placed(s, p.fg, SAFE)}`)));
    tasks.push(rp(`${k}/android/mipmap-${d}/ic_launcher_round.png`, svg(s, `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="${p.bg}"/>${placed(s, p.fg, SAFE)}`)));
  }

  // --- Web ---
  w(`${k}/web/favicon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${p.name}"><style>@media (prefers-color-scheme:dark){.bg{fill:${p.bgDark || p.bg}}}</style><rect class="bg" width="64" height="64" rx="14" fill="${p.bg}"/>${placedAt(64, p.fg, 0.62)}</svg>`);
  w(`${k}/web/mask-icon.svg`, svg(16, placed(16, '#000000', 0.7)));
  tasks.push(rp(`${k}/web/apple-touch-180.png`, composite(p.bg, 180)));
  tasks.push(rp(`${k}/web/maskable-512.png`, svg(512, `<rect width="512" height="512" fill="${p.bg}"/>${placed(512, p.fg, 0.5)}`)));
  for (const s of [16, 32, 192, 512]) tasks.push(rp(`${k}/web/icon-${s}.png`, svg(s, `<rect width="${s}" height="${s}" rx="${(s * 0.16).toFixed(1)}" fill="${p.bg}"/>${placed(s, p.fg, 0.64)}`)));
}

function placedAt(size, fill, frac) { return placed(size, fill, frac); }
async function flattenLast(rel, bg) { const p = join(OUT, rel); const buf = await sharp(p).flatten({ background: bg }).png().toBuffer(); await sharp(buf).toFile(p); }

await Promise.all(tasks);
console.log(`brandkit: generated icons for ${cfg.products.map((p) => p.key).join(', ')} -> ${OUT}`);
