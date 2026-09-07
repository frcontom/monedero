import sharp from "sharp";
import { mkdirSync } from "node:fs";

const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#2563eb"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="bold" font-size="${size * 0.55}" fill="#ffffff">₵</text>
</svg>`;

const out = "public";
mkdirSync(out, { recursive: true });

await sharp(Buffer.from(svg(192))).png().toFile(`${out}/icon-192.png`);
await sharp(Buffer.from(svg(512))).png().toFile(`${out}/icon-512.png`);

console.log("iconos generados");