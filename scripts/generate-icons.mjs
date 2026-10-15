import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(size) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // 8-bit
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // no interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines
  const rawRows = [];
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.35;
  const innerR = size * 0.18;
  const dotR = size * 0.05;
  const crosshairW = Math.max(2, Math.floor(size * 0.035));

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter None
    for (let x = 0; x < size; x++) {
      const idx = 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Rounded rect background (#090d16)
      const cornerR = size * 0.22;
      const qx = Math.max(0, Math.abs(dx) - (cx - cornerR));
      const qy = Math.max(0, Math.abs(dy) - (cy - cornerR));
      const cornerDist = Math.sqrt(qx * qx + qy * qy);

      if (cornerDist > cornerR) {
        // Transparent outside rounded corners
        row[idx] = 0; row[idx+1] = 0; row[idx+2] = 0; row[idx+3] = 0;
        continue;
      }

      // Default dark bg (#0b1120)
      let r = 11, g = 17, b = 32, a = 255;

      // Outer ring border (#1f293d)
      if (cornerDist > cornerR - 3) {
        r = 31; g = 41; b = 61;
      }

      // Crosshair gold target circle (#f59e0b)
      const ringThick = Math.max(2, size * 0.035);
      if (Math.abs(dist - outerR) < ringThick) {
        r = 245; g = 158; b = 11;
      } else if (Math.abs(dist - innerR) < Math.max(1.5, ringThick * 0.6)) {
        // Inner cyan ring (#06b6d4)
        r = 6; g = 182; b = 212;
      } else if (dist <= dotR) {
        // Center gold dot
        r = 245; g = 158; b = 11;
      } else if (
        (Math.abs(dx) < crosshairW / 2 && dist > innerR && dist < outerR * 1.3) ||
        (Math.abs(dy) < crosshairW / 2 && dist > innerR && dist < outerR * 1.3)
      ) {
        // Crosshair reticle ticks (#f59e0b)
        r = 245; g = 158; b = 11;
      }

      row[idx] = r;
      row[idx+1] = g;
      row[idx+2] = b;
      row[idx+3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

fs.writeFileSync('public/pwa-192x192.png', generatePng(192));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180));
console.log('PNG icons generated successfully!');
