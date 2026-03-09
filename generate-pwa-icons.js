#!/usr/bin/env node
/**
 * MSAMBWA PWA Icon Generator
 * Zero dependencies — pure Node.js built-ins only.
 * Writes real PNG files using raw PNG encoding (zlib is built into Node).
 */

const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const OUT = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

// ── Brand colours ──────────────────────────────────────────────
const TEAL  = [28,  122, 140, 255];
const WHITE = [255, 255, 255, 255];
const CLEAR = [0,   0,   0,   0  ];

// ── Minimal PNG encoder ────────────────────────────────────────
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const len  = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const tBuf = Buffer.from(type);
  const crc  = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([tBuf, data])));
  return Buffer.concat([len, tBuf, data, crc]);
}

function encodePNG(pixels, width, height) {
  // pixels: flat Uint8Array of RGBA values, row by row
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width,  0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 2;  // colour type: RGB  (we'll use RGBA → type 6)
  ihdr[9]  = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Build raw image data (filter byte 0 per row)
  const raw = Buffer.alloc((1 + width * 4) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter none
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = y * (1 + width * 4) + 1 + x * 4;
      raw[dst]   = pixels[src];
      raw[dst+1] = pixels[src+1];
      raw[dst+2] = pixels[src+2];
      raw[dst+3] = pixels[src+3];
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Drawing helpers ────────────────────────────────────────────
function setPixel(pixels, width, x, y, color) {
  if (x < 0 || x >= width || y < 0 || y >= width) return;
  const i = (y * width + x) * 4;
  // Alpha blend onto existing
  const a = color[3] / 255;
  pixels[i]   = Math.round(color[0] * a + pixels[i]   * (1 - a));
  pixels[i+1] = Math.round(color[1] * a + pixels[i+1] * (1 - a));
  pixels[i+2] = Math.round(color[2] * a + pixels[i+2] * (1 - a));
  pixels[i+3] = Math.min(255, pixels[i+3] + color[3]);
}

function fillRect(pixels, w, x, y, rw, rh, color) {
  for (let py = y; py < y + rh; py++)
    for (let px = x; px < x + rw; px++)
      setPixel(pixels, w, px, py, color);
}

function fillRoundedRect(pixels, size, x, y, w, h, r, color) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const dx = Math.min(px - x, x + w - 1 - px);
      const dy = Math.min(py - y, y + h - 1 - py);
      if (dx < r && dy < r) {
        const dist = Math.sqrt((r - dx) ** 2 + (r - dy) ** 2);
        if (dist > r) continue;
        // Anti-alias edge
        const alpha = Math.max(0, Math.min(1, r - dist + 0.5));
        setPixel(pixels, size, px, py, [...color.slice(0,3), Math.round(color[3] * alpha)]);
        continue;
      }
      setPixel(pixels, size, px, py, color);
    }
  }
}

function fillTriangle(pixels, size, ax, ay, bx, by, cx, cy, color) {
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
  const maxX = Math.min(size - 1, Math.ceil(Math.max(ax, bx, cx)));
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy)));
  const maxY = Math.min(size - 1, Math.ceil(Math.max(ay, by, cy)));

  const sign = (p1x, p1y, p2x, p2y, p3x, p3y) =>
    (p1x - p3x) * (p2y - p3y) - (p2x - p3x) * (p1y - p3y);

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const d1 = sign(px, py, ax, ay, bx, by);
      const d2 = sign(px, py, bx, by, cx, cy);
      const d3 = sign(px, py, cx, cy, ax, ay);
      const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
      const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);
      if (!(hasNeg && hasPos)) setPixel(pixels, size, px, py, color);
    }
  }
}

// ── Icon drawing ───────────────────────────────────────────────
function makeIcon(size, maskable = false) {
  const pixels = new Uint8Array(size * size * 4); // all transparent

  const r = maskable ? 0 : Math.round(size * 0.22);

  // Background
  fillRoundedRect(pixels, size, 0, 0, size, size, r, TEAL);

  // "M" letter dimensions
  const pad  = Math.round(size * (maskable ? 0.20 : 0.17));
  const s    = size - pad * 2;
  const x0   = pad;
  const y0   = pad;
  const x1   = pad + s;
  const y1   = pad + s;
  const midX = Math.round(size / 2);
  const midY = Math.round(y0 + s * 0.52);
  const lw   = Math.max(2, Math.round(s * 0.13));

  // Left stem
  fillRect(pixels, size, x0, y0, lw, s, WHITE);
  // Right stem
  fillRect(pixels, size, x1 - lw, y0, lw, s, WHITE);

  // Left diagonal: top-left → center-mid
  fillTriangle(pixels, size,
    x0, y0,
    x0 + lw, y0,
    midX + Math.round(lw / 2), midY,
    WHITE
  );
  fillTriangle(pixels, size,
    x0, y0,
    midX - Math.round(lw / 2), midY,
    midX + Math.round(lw / 2), midY,
    WHITE
  );

  // Right diagonal: top-right → center-mid
  fillTriangle(pixels, size,
    x1, y0,
    x1 - lw, y0,
    midX - Math.round(lw / 2), midY,
    WHITE
  );
  fillTriangle(pixels, size,
    x1, y0,
    midX - Math.round(lw / 2), midY,
    midX + Math.round(lw / 2), midY,
    WHITE
  );

  return encodePNG(pixels, size, size);
}

// ── Icon list ──────────────────────────────────────────────────
const ICONS = [
  { size: 32,  name: 'icon-32x32.png'               },
  { size: 72,  name: 'icon-72x72.png'               },
  { size: 96,  name: 'icon-96x96.png'               },
  { size: 128, name: 'icon-128x128.png'             },
  { size: 144, name: 'icon-144x144.png'             },
  { size: 152, name: 'icon-152x152.png'             },
  { size: 192, name: 'icon-192x192.png'             },
  { size: 384, name: 'icon-384x384.png'             },
  { size: 512, name: 'icon-512x512.png'             },
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 180, name: 'apple-touch-icon.png'         },
  { size: 192, name: 'icon-192x192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512x512-maskable.png', maskable: true },
];

// ── Run ────────────────────────────────────────────────────────
let ok = 0;
for (const icon of ICONS) {
  try {
    const buf = makeIcon(icon.size, icon.maskable || false);
    fs.writeFileSync(path.join(OUT, icon.name), buf);
    console.log(`  ✓  ${icon.name}  (${icon.size}×${icon.size})`);
    ok++;
  } catch(e) {
    console.error(`  ✗  ${icon.name}: ${e.message}`);
  }
}
console.log(`\n✅  ${ok}/${ICONS.length} icons written to public/icons/\n`);
