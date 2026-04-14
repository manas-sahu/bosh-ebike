#!/usr/bin/env node

/**
 * Pre-flight check: verifies all required environment variables
 * and configuration before running the dashboard.
 *
 * Usage: node scripts/check-setup.mjs
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const REQUIRED_VARS = [
  "AUTH_BOSCH_CLIENT_ID",
  "AUTH_BOSCH_CLIENT_SECRET",
  "AUTH_SECRET",
];

const OPTIONAL_VARS = [
  "AUTH_BOSCH_ISSUER",
  "BOSCH_API_BASE_URL",
  "NEXTAUTH_URL",
];

let hasError = false;

function pass(msg) { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); }
function fail(msg) { console.log(`  \x1b[31m✗\x1b[0m ${msg}`); hasError = true; }
function warn(msg) { console.log(`  \x1b[33m!\x1b[0m ${msg}`); }
function info(msg) { console.log(`  \x1b[36mi\x1b[0m ${msg}`); }

console.log("\n\x1b[1mBosch eBike Dashboard — Setup Check\x1b[0m\n");

// Check .env.local exists
const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  pass(".env.local file exists");
} else {
  fail(".env.local not found — run: cp .env.example .env.local");
  console.log("\n\x1b[31mSetup incomplete. Fix the errors above and try again.\x1b[0m\n");
  process.exit(1);
}

// Parse .env.local
const envContent = readFileSync(envPath, "utf-8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const [key, ...rest] = trimmed.split("=");
  envVars[key.trim()] = rest.join("=").trim();
}

// Check required vars
for (const varName of REQUIRED_VARS) {
  const value = envVars[varName];
  if (!value) {
    fail(`${varName} is empty or missing`);
  } else if (varName === "AUTH_BOSCH_CLIENT_ID" && !value.startsWith("euda-")) {
    warn(`${varName} doesn't start with "euda-" — is this correct?`);
  } else if (varName === "AUTH_SECRET" && value.length < 20) {
    fail(`${varName} is too short (min 20 chars) — run: npx auth secret`);
  } else {
    pass(`${varName} is set`);
  }
}

// Check optional vars
for (const varName of OPTIONAL_VARS) {
  const value = envVars[varName];
  if (value) {
    pass(`${varName} = ${value}`);
  } else {
    info(`${varName} not set — using default`);
  }
}

// Check redirect URI reminder
console.log("");
info("Bosch Portal redirect URI must be: http://localhost:3000/api/auth/callback/bosch");
info("Data sharing must be enabled at: https://flow.bosch-ebike.com");

console.log("");
if (hasError) {
  console.log("\x1b[31mSetup incomplete. Fix the errors above and try again.\x1b[0m\n");
  process.exit(1);
} else {
  console.log("\x1b[32mAll checks passed! Run: npm run dev\x1b[0m\n");
}
