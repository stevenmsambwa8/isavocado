#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   MSAMBWA — iOS Splash Screen Generator
   Generates all required apple-touch-startup-image sizes.
   
   Usage:
     npm install --save-dev sharp
     node scripts/generate-splash.js
   
   Source: public/icons/source.png (your square logo)
   Output: public/splash/splash-{W}x{H}.png
───────────────────────────────────────────────────────────── */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const SRC    = path.join(__dirname, '../public/icons/source.png');
const OUTDIR = path.join(__dirname, '../public/splash');
fs.mkdirSync(OUTDIR, { recursive: true });

// Brand colour (matches theme_color in manifest.json)
const BG = { r: 28, g: 122, b: 140, alpha: 1 };

// All iOS device splash dimensions
const SPLASHES = [
  { w: 1290, h: 2796, name: 'splash-1290x2796.png' }, // iPhone 16 Pro Max
  { w: 1179, h: 2556, name: 'splash-1179x2556.png' }, // iPhone 16 / 15 Pro
  { w: 1170, h: 2532, name: 'splash-1170x2532.png' }, // iPhone 13/14
  { w: 1125, h: 2436, name: 'splash-1125x2436.png' }, // iPhone X/XS/11 Pro
  { w: 1242, h: 2688, name: 'splash-1242x2688.png' }, // iPhone XS Max
  { w:  828, h: 1792, name: 'splash-828x1792.png'  }, // iPhone XR/11
  { w:  750, h: 1334, name: 'splash-750x1334.png'  }, // iPhone SE / 8
  { w: 2048, h: 2732, name: 'splash-2048x2732.png' }, // iPad Pro 12.9"
  { w: 1640, h: 2360, name: 'splash-1640x2360.png' }, // iPad Air / Pro 11"
  { w: 1536, h: 2048, name: 'splash-1536x2048.png' }, // iPad 9th gen
];

async function generateSplash() {
  if (!fs.existsSync(SRC)) {
    console.error(`\n❌  Source not found: ${SRC}\n`);
    process.exit(1);
  }

  console.log('Generating iOS splash screens...\n');

  for (const s of SPLASHES) {
    // Logo size = 1/3 of the shorter dimension, centred
    const logoSize = Math.round(Math.min(s.w, s.h) / 3);

    // 1. Resize logo with transparent background
    const logoBuffer = await sharp(SRC)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r:0,g:0,b:0,alpha:0 } })
      .png()
      .toBuffer();

    // 2. Create brand-coloured canvas
    const x = Math.round((s.w - logoSize) / 2);
    const y = Math.round((s.h - logoSize) / 2);

    await sharp({
      create: { width: s.w, height: s.h, channels: 4, background: BG }
    })
      .composite([{ input: logoBuffer, left: x, top: y }])
      .png({ compressionLevel: 9 })
      .toFile(path.join(OUTDIR, s.name));

    console.log(`  ✓  ${s.name}  (${s.w}×${s.h})`);
  }

  console.log('\n✅  All splash screens generated!\n');
}

generateSplash().catch(err => {
  console.error(err);
  process.exit(1);
});
