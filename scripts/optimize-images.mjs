import sharp from "sharp";
import path from "path";
import fs from "fs";

const ASSETS_DIR = path.resolve("attached_assets");

const screenshots = [
  "image_1767721768477.webp",
  "image_1767722378330.webp",
  "image_1767722411166.webp",
  "image_1767722513225.webp",
  "image_1767722701881.webp",
  "image_1767722742410.webp",
  "image_1771727306289.webp",
  "image_1771727330619.webp",
  "image_1771727357455.webp",
  "image_1771727402341.webp",
];

async function resizeScreenshot(file) {
  const inputPath = path.join(ASSETS_DIR, file);
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const outputPath = path.join(ASSETS_DIR, `${base}-720.webp`);

  const inputStat = fs.statSync(inputPath);
  await sharp(inputPath)
    .resize({ width: 720 })
    .webp({ quality: 78, effort: 6 })
    .toFile(outputPath);
  const outputStat = fs.statSync(outputPath);

  console.log(
    `${file} -> ${base}-720.webp | ${(inputStat.size / 1024).toFixed(1)}KB -> ${(outputStat.size / 1024).toFixed(1)}KB`
  );
}

async function main() {
  for (const file of screenshots) {
    await resizeScreenshot(file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
