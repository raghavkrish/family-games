#!/usr/bin/env node
/**
 * Load .env then .env.local and run Next + PartyKit with configurable ports.
 * Precedence: shell/CI env > .env.local > .env > defaults.
 * Vars: HOST, PORT, NEXT_PUBLIC_PARTYKIT_PORT, NEXT_PUBLIC_PARTYKIT_HOST
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseEnvFile(path) {
  /** @type {Record<string, string>} */
  const out = {};
  if (!existsSync(path)) return out;
  for (const raw of readFileSync(path, "utf8").split(/\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const fromFiles = {
  ...parseEnvFile(resolve(root, ".env")),
  ...parseEnvFile(resolve(root, ".env.local")),
};
for (const [key, val] of Object.entries(fromFiles)) {
  if (process.env[key] === undefined) process.env[key] = val;
}

const mode = process.argv[2] ?? "dev";
const host = process.env.HOST ?? "0.0.0.0";
const port = process.env.PORT ?? "3000";
// Process listen port (nginx proxies here). Empty NEXT_PUBLIC_PARTYKIT_PORT
// means "browser uses 443"; PartyKit still listens on PARTYKIT_PORT or 1999.
const partyPort =
  process.env.PARTYKIT_PORT?.trim() ||
  process.env.NEXT_PUBLIC_PARTYKIT_PORT?.trim() ||
  "1999";

const nextBin = resolve(root, "node_modules/.bin/next");
const partyBin = resolve(root, "node_modules/.bin/partykit");
const concurrentlyBin = resolve(root, "node_modules/.bin/concurrently");

const nextArgs =
  mode === "start" || mode === "start:next"
    ? ["start", "--hostname", host, "--port", port]
    : ["dev", "--hostname", host, "--port", port];

const nextOnly = mode === "dev:next" || mode === "start:next";
const partyOnly = mode === "dev:party";

function run(command, args) {
  const child = spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 1);
  });
}

if (partyOnly) {
  run(partyBin, ["dev", "--port", partyPort]);
} else if (nextOnly) {
  run(nextBin, nextArgs);
} else {
  const nextCmd = `${JSON.stringify(nextBin)} ${nextArgs.map((a) => JSON.stringify(a)).join(" ")}`;
  const partyCmd = `${JSON.stringify(partyBin)} ${["dev", "--port", partyPort].map((a) => JSON.stringify(a)).join(" ")}`;
  run(concurrentlyBin, [
    "-k",
    "-n",
    "next,party",
    "-c",
    "cyan,magenta",
    nextCmd,
    partyCmd,
  ]);
}
