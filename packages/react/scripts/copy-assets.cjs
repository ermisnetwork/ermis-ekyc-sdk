#!/usr/bin/env node

/**
 * ermis-ekyc-setup
 *
 * Copies required meeting static assets (codec-polyfill, opus_decoder, polyfills, raptorQ, workers)
 * from the ermis-ekyc-react package into the consumer project's public/ folder.
 *
 * Usage:
 *   - Runs automatically via postinstall when installing ermis-ekyc-react
 *   - Or manually: npx ermis-ekyc-setup
 */

const fs = require("fs");
const path = require("path");

const ASSET_DIRS = [
  "codec-polyfill",
  "opus_decoder",
  "polyfills",
  "raptorQ",
  "workers",
];

// ── Find the consumer project root ──────────────────────────
function findProjectRoot() {
  // When running via postinstall: cwd is inside node_modules/ermis-ekyc-react/
  // When running via npx: cwd is the consumer project root
  let dir = process.cwd();

  // If we're inside node_modules, go up to the project root
  const nmIndex = dir.indexOf("node_modules");
  if (nmIndex !== -1) {
    dir = dir.substring(0, nmIndex);
  }

  // Verify it looks like a project root (has package.json)
  if (fs.existsSync(path.join(dir, "package.json"))) {
    return dir;
  }

  return dir;
}

// ── Copy directory recursively ──────────────────────────────
function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;

  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Main ────────────────────────────────────────────────────
function main() {
  const projectRoot = findProjectRoot();
  const publicDir = path.join(projectRoot, "public");

  // Where our bundled assets live
  const packagePublicDir = path.join(__dirname, "..", "public");

  if (!fs.existsSync(packagePublicDir)) {
    console.warn(
      "[ermis-ekyc] Warning: public/ folder not found in package, skipping asset copy.",
    );
    return;
  }

  let copied = 0;

  for (const dir of ASSET_DIRS) {
    const src = path.join(packagePublicDir, dir);
    const dest = path.join(publicDir, dir);

    if (!fs.existsSync(src)) {
      continue;
    }

    copyDirSync(src, dest);
    copied++;
  }

  if (copied > 0) {
    console.log(
      `[ermis-ekyc] ✅ Copied ${copied} asset folder(s) to ${publicDir}`,
    );
  } else {
    console.log("[ermis-ekyc] No asset folders to copy.");
  }
}

main();
