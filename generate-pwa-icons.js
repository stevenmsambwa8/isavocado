#!/usr/bin/env node
/**
 * MSAMBWA PWA Icon Generator
 * Uses only the 'canvas' package — added automatically via prebuild.
 * Generates all icons into public/icons/
 */

const { createCanvas } = require('canvas');
const fs   = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

// Brand colours
const TEAL  = '#1C7A8C';
const WHITE = '#ffffff';

function makeIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx    = canvas.getContext('2d');
  const r      = maskable ? 0 : size * 0.22;

  // Background
  ctx.fillStyle = TEAL;
  if (maskable) {
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
  }

  // "M" letter
  const pad  = maskable ? size * 0.20 : size * 0.17;
  const s    = size - pad * 2;
  const x0   = pad;
  const y0   = pad;
  const x1   = pad + s;
  const y1   = pad + s;
  const midX = size / 2;
  const midY = y0 + s * 0.52;
  const lw   = Math.max(2, s * 0.13);

  ctx.fillStyle = WHITE;

  // Left stem
  ctx.fillRect(x0, y0, lw, s);
  // Right stem
  ctx.fillRect(x1 - lw, y0, lw, s);

  // Left diagonal
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x0 + lw, y0);
  ctx.lineTo(midX + lw / 2, midY);
  ctx.lineTo(midX - lw / 2, midY);
  ctx.closePath();
  ctx.fill();

  // Right diagonal
  ctx.beginPath();
  ctx.moveTo(x1, y0);
  ctx.lineTo(x1 - lw, y0);
  ctx.lineTo(midX - lw / 2, midY);
  ctx.lineTo(midX + lw / 2, midY);
  ctx.closePath();
  ctx.fill();

  return canvas.toBuffer('image/png');
}

const ICONS = [
  { size: 32,  name: 'icon-32x32.png'              },
  { size: 72,  name: 'icon-72x72.png'              },
  { size: 96,  name: 'icon-96x96.png'              },
  { size: 128, name: 'icon-128x128.png'            },
  { size: 144, name: 'icon-144x144.png'            },
  { size: 152, name: 'icon-152x152.png'            },
  { size: 192, name: 'icon-192x192.png'            },
  { size: 384, name: 'icon-384x384.png'            },
  { size: 512, name: 'icon-512x512.png'            },
  { size: 120, name: 'apple-touch-icon-120x120.png'},
  { size: 180, name: 'apple-touch-icon.png'        },
  { size: 192, name: 'icon-192x192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512x512-maskable.png', maskable: true },
];

let ok = 0;
for (const icon of ICONS) {
  try {
    const buf = makeIcon(icon.size, icon.maskable || false);
    fs.writeFileSync(path.join(OUT, icon.name), buf);
    console.log(`  ✓  ${icon.name}`);
    ok++;
  } catch (e) {
    console.error(`  ✗  ${icon.name}: ${e.message}`);
  }
}

console.log(`\n✅  ${ok}/${ICONS.length} icons written to public/icons/\n`);
