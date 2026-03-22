const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = path.join(__dirname, '../src/images');
const QUALITY = 75;

let total = 0, compressed = 0, savedBytes = 0;

function getAllImages(dir) {
  const files = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      files.push(...getAllImages(full));
    } else if (/\.(png|jpg|jpeg|webp)$/i.test(file)) {
      files.push(full);
    }
  });
  return files;
}

async function compress(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const originalSize = fs.statSync(filePath).size;
  const tmp = filePath + '.tmp';

  try {
    if (ext === '.png') {
      await sharp(filePath).png({ quality: QUALITY, compressionLevel: 9 }).toFile(tmp);
    } else {
      await sharp(filePath).jpeg({ quality: QUALITY }).toFile(tmp);
    }

    const newSize = fs.statSync(tmp).size;
    if (newSize < originalSize) {
      fs.renameSync(tmp, filePath);
      savedBytes += (originalSize - newSize);
      compressed++;
      console.log(`✓ ${path.relative(INPUT_DIR, filePath)} — ${(originalSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB`);
    } else {
      fs.unlinkSync(tmp);
      console.log(`- ${path.relative(INPUT_DIR, filePath)} — already optimized`);
    }
  } catch (e) {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.log(`✗ ${path.relative(INPUT_DIR, filePath)} — ${e.message}`);
  }
  total++;
}

async function run() {
  const images = getAllImages(INPUT_DIR);
  console.log(`\nFound ${images.length} images...\n`);
  for (const img of images) await compress(img);
  console.log(`\nDone! ${compressed}/${total} compressed. Saved: ${(savedBytes/1024/1024).toFixed(1)}MB`);
}

run();
