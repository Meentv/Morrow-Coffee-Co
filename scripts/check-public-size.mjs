#!/usr/bin/env node
/**
 * Guards `public/` against large files.
 *
 * Why this exists: `public/` is copied verbatim into `dist/` at build time, so
 * anything placed there is deployed AND downloadable at a predictable URL even
 * if no code references it. That already happened once — a 22.8 MB video master
 * sat in `public/images/` and shipped on every build while the site actually
 * served the ~1 MB encodes from `public/media/`.
 *
 * Masters belong in `assets/source/`, which is never published. See
 * docs/VIDEO_SETUP.md.
 *
 * Runs as part of `npm run build`, so the regression cannot reach production.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const PUBLIC_DIR = "public";
/** Nothing that ships to the browser should be bigger than this. */
const LIMIT_BYTES = 1.5 * 1024 * 1024;

/** Deliberately large, and reviewed: the hero ladder + posters. */
const ALLOWED = new Set(["media/hero-1920.mp4", "media/hero-1280.mp4", "media/hero-1280.webm"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const offenders = walk(PUBLIC_DIR)
  .filter((file) => !ALLOWED.has(relative(PUBLIC_DIR, file).split("\\").join("/")))
  .map((file) => ({ file, size: statSync(file).size }))
  .filter(({ size }) => size > LIMIT_BYTES);

if (offenders.length > 0) {
  console.error("\n✖ Large files in public/ — these WILL be deployed and downloadable.\n");
  for (const { file, size } of offenders) {
    console.error(`   ${file}  ${(size / 1024 / 1024).toFixed(1)} MB`);
  }
  console.error(
    "\n  Move source masters to assets/source/ (not published), or add a\n" +
      "  deliberately sized web asset to the ALLOWED list in\n" +
      "  scripts/check-public-size.mjs with a comment explaining the size.\n",
  );
  process.exit(1);
}

console.log("✓ public/ contains no unexpected files over 1.5 MB");
