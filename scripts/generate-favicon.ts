import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '..', 'public');
const logoPath = path.join(publicDir, 'logo.jpg');
const favicon32Path = path.join(publicDir, 'favicon-32x32.png');
const favicon16Path = path.join(publicDir, 'favicon-16x16.png');

async function generateFavicon() {
  try {
    const [buf16, buf32] = await Promise.all([
      sharp(logoPath)
        .resize(16, 16, { fit: 'contain', background: { r: 10, g: 34, b: 24, alpha: 1 } })
        .png()
        .toBuffer(),
      sharp(logoPath)
        .resize(32, 32, { fit: 'contain', background: { r: 10, g: 34, b: 24, alpha: 1 } })
        .png()
        .toBuffer(),
    ]);

    await Promise.all([
      sharp(buf16).toFile(favicon16Path),
      sharp(buf32).toFile(favicon32Path),
    ]);

    console.log(`Favicon PNGs generated at ${publicDir}`);
  } catch (error) {
    console.error('Failed to generate favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
