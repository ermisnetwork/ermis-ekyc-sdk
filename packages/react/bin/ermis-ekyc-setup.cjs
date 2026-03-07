#!/usr/bin/env node

/**
 * CLI entry point for ermis-ekyc-setup
 *
 * Usage: npx ermis-ekyc-setup
 *
 * Copies required meeting static assets into the consumer project's public/ folder.
 */

require("../scripts/copy-assets.cjs");
