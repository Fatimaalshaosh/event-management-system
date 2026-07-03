/* Generate ONLY a small test batch of executive portraits via the api-server.
 *
 * Usage (after the API key is in .env and the api-server is running):
 *   pnpm --filter @workspace/scripts run portraits:test           # 5 portraits
 *   LIMIT=2 pnpm --filter @workspace/scripts run portraits:test   # fewer
 *
 * It calls POST /api/portraits/generate, which generates + caches on the server.
 * It never generates the full directory — only the archetypes below, capped by LIMIT. */

const API = process.env.PORTRAIT_API ?? "http://localhost:8080";
const LIMIT = Number(process.env.LIMIT ?? process.argv[2] ?? 5);

type Archetype = {
  key: string; name: string; gender: "male" | "female";
  nationality: string; department: string; role: string; seniority: string;
};

const ARCHETYPES: Archetype[] = [
  { key: "test-emirati-male-exec", name: "Khalifa Al Mheiri", gender: "male", nationality: "AE", department: "chairmanOffice", role: "Director", seniority: "executive" },
  { key: "test-emirati-female-exec", name: "Mariam Al Suwaidi", gender: "female", nationality: "AE", department: "secretaryGeneral", role: "Director", seniority: "executive" },
  { key: "test-international-suit", name: "Pierre Aubert", gender: "male", nationality: "FR", department: "protocol", role: "Liaison Advisor", seniority: "senior" },
  { key: "test-security-uniform", name: "Mark Reynolds", gender: "male", nationality: "GB", department: "operations", role: "Security Coordinator", seniority: "staff" },
  { key: "test-staff-officer", name: "Noura Al Kaabi", gender: "female", nationality: "AE", department: "planning", role: "Planning Officer", seniority: "staff" },
];

async function main() {
  const batch = ARCHETYPES.slice(0, Math.max(0, LIMIT));
  console.log(`Generating ${batch.length} test portrait(s) via ${API} …`);
  let ok = 0;
  for (const a of batch) {
    try {
      const res = await fetch(`${API}/api/portraits/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(a),
      });
      const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string; cached?: boolean };
      if (res.ok && json.url) {
        ok++;
        console.log(`  ✓ ${a.key} → ${json.url}${json.cached ? " (cached)" : ""}`);
      } else {
        console.log(`  ✗ ${a.key} → HTTP ${res.status} ${json.error ?? ""}`);
      }
    } catch (e) {
      console.error(`  ✗ ${a.key} → request failed:`, (e as Error).message);
    }
  }
  console.log(`Done: ${ok}/${batch.length} generated.`);
  if (ok === 0) {
    console.log("Hint: ensure the api-server is running and AI_INTEGRATIONS_OPENAI_API_KEY + AI_INTEGRATIONS_OPENAI_BASE_URL are set in .env.");
  }
}

main();
