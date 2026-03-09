#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   MSAMBWA — PWA Icon Generator
   Usage:
     1. Place your source logo at: public/icons/source.png
        (minimum 512×512, transparent background recommended)
     2. Run:  node scripts/generate-icons.js
   
   Requires: sharp
     npm install --save-dev sharp
───────────────────────────────────────────────────────────── */

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const SRC    = path.join(__dirname, '../public/icons/source.png');
const OUTDIR = path.join(__dirname, '../public/icons');

// Ensure output dir exists
fs.mkdirSync(OUTDIR, { recursive: true });

const ICONS = [
  // Standard PWA icons (manifest.json)
  { size: 72,  name: 'icon-72x72.png'   },
  { size: 96,  name: 'icon-96x96.png'   },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },

  // Favicon
  { size: 32,  name: 'icon-32x32.png'   },

  // iOS home screen icons
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 144, name: 'apple-touch-icon-144x144.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 180, name: 'apple-touch-icon.png'         }, // default apple-touch-icon
];

// Maskable icons need padding (~10% safe zone on each side)
const MASKABLE = [192, 512];

async function generateIcons() {
  if (!fs.existsSync(SRC)) {
    console.error(`\n❌  Source icon not found at: ${SRC}`);
    console.error('   Place your 512×512 PNG logo there and re-run.\n');
    process.exit(1);
  }

  console.log('Generating PWA icons from:', SRC);

  for (const icon of ICONS) {
    const out = path.join(OUTDIR, icon.name);

    if (MASKABLE.includes(icon.size)) {
      // Maskable: add white background + padding (18% each side = 36% total)
      const pad     = Math.round(icon.size * 0.18);
      const imgSize = icon.size - pad * 2;

      await sharp(SRC)
        .resize(imgSize, imgSize, { fit: 'contain', background: { r:255,g:255,b:255,alpha:0 } })
        .extend({ top:pad, bottom:pad, left:pad, right:pad, background: { r:28,g:122,b:140,alpha:1 } })
        .png()
        .toFile(out);
    } else {
      await sharp(SRC)
        .resize(icon.size, icon.size, { fit: 'contain', background: { r:255,g:255,b:255,alpha:0 } })
        .png()
        .toFile(out);
    }

    console.log(`  ✓  ${icon.name}  (${icon.size}×${icon.size})`);
  }

  // Generate a simple favicon.ico placeholder (just point to 32x32 png)
  console.log('\n✅  All icons generated!');
  console.log('\nNext steps:');
  console.log('  1. Check public/icons/ — verify icons look correct');
  console.log('  2. Generate splash screens:  node scripts/generate-splash.js');
  console.log('  3. Deploy and test at:  https://web.dev/measure/\n');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
