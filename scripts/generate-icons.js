import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, colorR, colorG, colorB) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 at start of each scanline
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // filter byte: none
    for (let x = 0; x < width; x++) {
      // Border ring in gold, background in dark green
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = width * 0.44;

      if (dist < radius) {
        // Inner circle
        const ringDist = Math.abs(dist - radius * 0.85);
        if (ringDist < width * 0.03) {
          // Gold accent ring
          rawData.writeUInt8(255, offset++);
          rawData.writeUInt8(233, offset++);
          rawData.writeUInt8(168, offset++);
          rawData.writeUInt8(255, offset++);
        } else {
          // Dark green brand #075C42
          rawData.writeUInt8(colorR, offset++);
          rawData.writeUInt8(colorG, offset++);
          rawData.writeUInt8(colorB, offset++);
          rawData.writeUInt8(255, offset++);
        }
      } else {
        // Brand background rounded
        rawData.writeUInt8(colorR, offset++);
        rawData.writeUInt8(colorG, offset++);
        rawData.writeUInt8(colorB, offset++);
        rawData.writeUInt8(255, offset++);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  // CRC32 calculation
  const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write 192x192, 512x512, apple-touch-icon (180x180), and maskable 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 7, 92, 66));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 7, 92, 66));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 19, 138, 98));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 7, 92, 66));
console.log('PWA PNG icons generated successfully!');
