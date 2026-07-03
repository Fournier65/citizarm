import sharp from "sharp";
import path from "path";
import fs from "fs";

const ASSETS_DIR = path.resolve("attached_assets");

const screenshots = [
  "image_1767721768477.png",
  "image_1767722378330.png",
  "image_1767722411166.png",
  "image_1767722513225.png",
  "image_1767722701881.png",
  "image_1767722742410.png",
  "image_1771727306289.png",
  "image_1771727330619.png",
  "image_1771727357455.png",
  "image_1771727402341.png",
];

const logo = "IMG_7582_1767640004029.jpeg";

async function convert(file, width, quality) {
  const inputPath = path.join(ASSETS_DIR, file);
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const outputPath = path.join(ASSETS_DIR, `${base}.webp`);

  const inputStat = fs.statSync(inputPath);
  await sharp(inputPath)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outputPath);
  const outputStat = fs.statSync(outputPath);

  console.log(
    `${file} -> ${base}.webp | ${(inputStat.size / 1024).toFixed(1)}KB -> ${(outputStat.size / 1024).toFixed(1)}KB`
  );
}

async function main() {
  for (const file of screenshots) {
    await convert(file, 960, 78);
  }
  await convert(logo, 256, 85);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
