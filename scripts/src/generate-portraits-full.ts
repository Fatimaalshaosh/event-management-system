/* Full executive portrait generation — PEOPLE ONLY, keyed by employeeId.
 *
 *   set -a; . ./.env; set +a   # then run the api-server on :8081
 *   PORTRAIT_API=http://localhost:8081 pnpm --filter @workspace/scripts run portraits:full
 *
 * Rules: organizations (embassy/government/vendor) are SKIPPED — never a portrait.
 * Each person's file is sha1(employeeId). Generates in batches of 15; verifies
 * each file before continuing; retries a failed portrait once; cache-aware. */

import crypto from "node:crypto";

const API = process.env.PORTRAIT_API ?? "http://localhost:8081";
const BATCH = 15;
const PEOPLE = new Set(["internal", "external", "vip"]);
const ORG = new Set(["embassy", "government", "vendor"]);
// Employee ids with a permanent curated portrait override (see PortraitService
// PORTRAIT_OVERRIDES) — never generated or regenerated in any batch.
const OVERRIDE_IDS = new Set(["me"]);
const fileFor = (id: string) => `${crypto.createHash("sha1").update(id).digest("hex").slice(0, 32)}.png`;

type Contact = { id: number; type: string; nameEn: string; gender?: string | null; countryCode?: string | null; departmentKey?: string | null; jobTitle?: string | null; protocolTitle?: string | null };

async function exists(file: string): Promise<boolean> {
  const r = await fetch(`${API}/api/portraits/files/${file}`, { method: "HEAD" });
  return r.ok;
}

async function genOne(c: Contact): Promise<"new" | "cached" | "fail"> {
  const employeeId = String(c.id);
  const gender = c.gender === "male" || c.gender === "female" ? c.gender : "male";
  const nationality = c.countryCode || "AE";
  const key = [c.id, c.nameEn, gender, nationality.toUpperCase(), c.departmentKey || ""].join("|");
  // No prompt sent → the route builds its role/nationality/age/plain-background prompt from these fields.
  const req = { key, employeeId, name: c.nameEn, gender, nationality, role: c.jobTitle || c.protocolTitle || "", department: c.departmentKey || "" };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(`${API}/api/portraits/generate`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(req) });
      const j = (await r.json().catch(() => ({}))) as { url?: string; cached?: boolean; error?: string };
      if (r.ok && j.url && (await exists(fileFor(employeeId)))) return j.cached ? "cached" : "new";
      console.log(`    retry ${c.nameEn} [${employeeId}] HTTP ${r.status} ${j.error ?? ""}`);
    } catch (e) { console.log(`    retry ${c.nameEn} [${employeeId}] ${(e as Error).message}`); }
  }
  return "fail";
}

async function main() {
  const contacts = (await (await fetch(`${API}/api/contacts`)).json()) as Contact[];
  const people = contacts.filter((c) => PEOPLE.has(c.type) && !OVERRIDE_IDS.has(String(c.id)));
  const orgs = contacts.filter((c) => ORG.has(c.type)).length;
  const totalBatches = Math.ceil(people.length / BATCH);

  // Two modes — both run ONE pass and STOP (never all batches automatically):
  //   ONLY_IDS=106,73   → regenerate only those employee ids
  //   BATCH_INDEX=0     → run only that single batch of 15, then pause
  const onlyIds = (process.env.ONLY_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const idx = Number(process.env.BATCH_INDEX ?? "0");
  const target = onlyIds.length ? people.filter((c) => onlyIds.includes(String(c.id))) : people.slice(idx * BATCH, idx * BATCH + BATCH);
  const label = onlyIds.length ? `Targeted regeneration of ${target.length} people (ONLY_IDS)` : `Batch ${idx + 1} of ${totalBatches}`;
  console.log(`${label} — ${target.length} people | total people ${people.length} | organizations skipped ${orgs}`);
  if (!target.length) { console.log("Nothing to do."); return; }

  let nw = 0, cached = 0, fail = 0;
  const failed: string[] = [];
  for (const c of target) {
    const res = await genOne(c);
    if (res === "new") { nw++; console.log(`  ✓ ${c.nameEn} [${c.id}] → ${fileFor(String(c.id))}`); }
    else if (res === "cached") { cached++; console.log(`  • ${c.nameEn} [${c.id}] cached`); }
    else { fail++; failed.push(`${c.nameEn}[${c.id}]`); console.log(`  ✗ ${c.nameEn} [${c.id}] FAILED`); }
  }
  console.log(`\nDONE — processed ${target.length} | generated ${nw} | cached ${cached} | failed ${fail}`);
  if (failed.length) console.log(`Failed: ${failed.join(", ")}`);
  if (!onlyIds.length && idx + 1 < totalBatches) {
    console.log(`\nPAUSED. One batch per run. After manual approval, re-run with BATCH_INDEX=${idx + 1} to continue.`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
