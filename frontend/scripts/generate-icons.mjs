/**
 * Generate all favicon / icon / OG image assets from source files.
 *
 * Usage:  node frontend/scripts/generate-icons.mjs
 *
 * Sources:
 *   - frontend/public/favicon.png  (48×48 circular icon → 16, 32 px)
 *   - frontend/public/images/logo/Fischer-electronics-logo-black.svg
 *     (full logo → 180, 192, 512 px icons & 1200×630 OG image)
 *
 * Outputs go to frontend/public/
 */

import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "..", "public");

const FAVICON_SRC = path.join(PUBLIC, "favicon.png");
const SVG_SRC = path.join(PUBLIC, "images", "logo", "Fischer-electronics-logo-black.svg");

async function main() {
  // ── Small favicons (from 48×48 PNG) ────────────────────────────────
  for (const size of [16, 32]) {
    const out = path.join(PUBLIC, `favicon-${size}x${size}.png`);
    await sharp(FAVICON_SRC)
      .resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png()
      .toFile(out);
    console.log(`✓ ${path.basename(out)}`);
  }

  // ── Large icons (from SVG on white square background) ──────────────
  for (const size of [180, 192, 512]) {
    // Render SVG into a region with padding, then composite onto white square
    const padding = Math.round(size * 0.1);
    const logoWidth = size - padding * 2;
    // The SVG aspect ratio is 784:465 ≈ 1.686
    const logoHeight = Math.round(logoWidth / (784 / 465));

    const logoBuffer = await sharp(SVG_SRC)
      .resize(logoWidth, logoHeight, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .png()
      .toBuffer();

    const name =
      size === 180
        ? "apple-touch-icon.png"
        : `android-chrome-${size}x${size}.png`;

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logoBuffer, gravity: "centre" }])
      .png()
      .toFile(path.join(PUBLIC, name));

    console.log(`✓ ${name}`);
  }

  // ── OG image (1200×630, SVG centered on white) ─────────────────────
  {
    const width = 1200;
    const height = 630;
    const logoPadding = 100;
    const logoWidth = width - logoPadding * 2; // 1000
    const logoHeight = Math.round(logoWidth / (784 / 465)); // ≈594, capped by canvas
    const finalLogoHeight = Math.min(logoHeight, height - logoPadding * 2);
    const finalLogoWidth = Math.round(finalLogoHeight * (784 / 465));

    const logoBuffer = await sharp(SVG_SRC)
      .resize(finalLogoWidth, finalLogoHeight, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([{ input: logoBuffer, gravity: "centre" }])
      .png()
      .toFile(path.join(PUBLIC, "og-image.png"));

    console.log("✓ og-image.png");
  }

  // ── favicon.ico (16 + 32 + 48 combined) ────────────────────────────
  // Use png-to-ico to bundle multiple sizes into one .ico
  try {
    const pngToIco = (await import("png-to-ico")).default;
    const fs = await import("fs");

    const buffers = await Promise.all(
      [
        path.join(PUBLIC, "favicon-16x16.png"),
        path.join(PUBLIC, "favicon-32x32.png"),
        FAVICON_SRC, // 48×48 original
      ].map((f) => fs.promises.readFile(f))
    );

    const ico = await pngToIco(buffers);
    await fs.promises.writeFile(path.join(PUBLIC, "favicon.ico"), ico);
    console.log("✓ favicon.ico");
  } catch (err) {
    console.warn("⚠ Could not generate favicon.ico (png-to-ico not available):", err.message);
    console.warn("  Install with: npm install --save-dev png-to-ico");
  }

  console.log("\nDone! All icons generated in frontend/public/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
