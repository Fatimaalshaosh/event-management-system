import express, { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/* Executive portrait generation.
 *
 * POST /api/portraits/generate  → returns { url } for a stable, cached portrait,
 * generating it via an external image provider on first request only.
 * GET  /api/portraits/files/<f> → serves the saved PNGs (static).
 *
 * The API key lives only in the server env (AI_INTEGRATIONS_OPENAI_API_KEY) and
 * is never sent to the frontend. The provider client is imported lazily, so the
 * server boots fine with no key configured (the route just returns 503). */

const router = Router();

const PORTRAITS_DIR = process.env.PORTRAITS_DIR
  ? path.resolve(process.env.PORTRAITS_DIR)
  : path.resolve(process.cwd(), ".portraits");

const PROVIDER = (process.env.PORTRAIT_PROVIDER ?? "openai").toLowerCase();

type GenBody = {
  key?: string;
  employeeId?: string;
  name?: string;
  gender?: string;
  nationality?: string;
  department?: string;
  role?: string;
  seniority?: string;
  prompt?: string;
};

function hasProviderKey(): boolean {
  return Boolean(
    process.env.AI_INTEGRATIONS_OPENAI_API_KEY && process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  );
}

function stableName(id: string): string {
  return crypto.createHash("sha1").update(id).digest("hex").slice(0, 32);
}

/** Pluggable generator — add gemini / flux / azure / localpack cases later;
 * the route, cache and frontend never change. */
async function generatePortrait(prompt: string): Promise<Buffer> {
  switch (PROVIDER) {
    case "openai": {
      const { generateImageBuffer } = await import("@workspace/integrations-openai-ai-server");
      return generateImageBuffer(prompt, "1024x1024");
    }
    default:
      throw new Error(`Unsupported PORTRAIT_PROVIDER: ${PROVIDER}`);
  }
}

/** Server-side prompt (used when the client doesn't send one) — nationality-matched
 * ethnicity, explicit attire, mature role-based age and one consistent studio style. */
const ETH: Record<string, string> = {
  AE: "Emirati Gulf-Arab", SA: "Saudi Gulf-Arab", QA: "Qatari Gulf-Arab", KW: "Kuwaiti Gulf-Arab", BH: "Bahraini Gulf-Arab", OM: "Omani Gulf-Arab",
  EG: "Egyptian Arab North-African", JO: "Jordanian Levantine Arab", MA: "Moroccan North-African Arab",
  FR: "French European", GB: "British European", DE: "German European", IT: "Italian European", ES: "Spanish European", CH: "Swiss European",
  US: "American", CA: "Canadian", AU: "Australian",
  JP: "Japanese", CN: "Chinese", KR: "Korean East-Asian", IN: "Indian South-Asian", PK: "Pakistani South-Asian", SG: "Singaporean Southeast-Asian", RU: "Russian Slavic",
};
function ethOf(iso?: string): string {
  // Never default to European — unknown gets a neutral professional appearance.
  return ETH[(iso ?? "AE").toUpperCase()] ?? "neutral international professional";
}

/** Broad appearance group (skin tone / eye-shape pools) — distinct from attire. */
function ethGroup(iso?: string): "arab" | "european" | "eastasian" | "southasian" | "namerica" | "neutral" {
  const k = (iso ?? "AE").toUpperCase();
  if (["AE", "SA", "QA", "KW", "BH", "OM", "EG", "JO", "MA"].includes(k)) return "arab";
  if (["FR", "GB", "DE", "IT", "ES", "CH", "RU"].includes(k)) return "european";
  if (["JP", "CN", "KR"].includes(k)) return "eastasian";
  if (["IN", "PK", "SG"].includes(k)) return "southasian";
  if (["US", "CA", "AU"].includes(k)) return "namerica";
  return "neutral";
}

/* Deterministic per-person variation: every trait is seeded from the stable
 * employeeId, so each employee gets a unique-but-reproducible face and no two
 * people of the same nationality look like relatives. */
function fnv(seed: string): number {
  let x = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) { x ^= seed.charCodeAt(i); x = Math.imul(x, 16777619); }
  return x >>> 0;
}
function pick<T>(id: string, salt: string, arr: T[]): T { return arr[fnv(id + "|" + salt) % arr.length]; }

/** Realistic modern UAE-government age band by role — capped ~55, never elderly. */
function ageBand(role: string): [number, number] {
  const r = role.toLowerCase();
  if (/intern|trainee/.test(r)) return [22, 25];
  if (/coordinator/.test(r)) return [23, 30];
  if (/chairman|secretary[ -]?general|president|head of state|king|emir|highness|crown prince|prime minister|\bminister\b/.test(r)) return [50, 55];
  if (/director[ -]?general|\bchief\b|\bceo\b/.test(r)) return [48, 55];
  if (/executive director/.test(r)) return [47, 54];
  if (/ambassador|envoy|consul|diplomat/.test(r)) return [45, 55];
  if (/\bdirector\b/.test(r)) return [45, 52];
  if (/senior manager/.test(r)) return [42, 50];
  if (/\bmanager\b/.test(r)) return [38, 48];
  if (/team lead|\blead\b|supervisor|head of/.test(r)) return [35, 45];
  if (/senior/.test(r)) return [32, 42];
  if (/engineer|specialist|analyst|architect|advisor|legal/.test(r)) return [27, 40];
  if (/officer/.test(r)) return [25, 35];
  if (/driver|chauffeur|security|guard|protection|reception|attendant|assistant|interpreter|translator|photographer|usher|steward/.test(r)) return [28, 42];
  return [30, 45];
}
function ageOf(id: string, role: string): number { const [lo, hi] = ageBand(role); return lo + (fnv(id + "|age") % (hi - lo + 1)); }

const FACE = ["an oval face", "a softly rounded face", "a square face", "a rectangular face", "a heart-shaped face", "a diamond-shaped face", "an oblong face", "a long narrow face", "a broad face", "an angular face"];
const JAW = ["a strong defined jawline", "a softly rounded jawline", "an angular jawline", "a tapered jawline", "a square jawline", "a gently rounded jawline", "a broad jawline", "a narrow chin"];
const NOSE = ["a straight nose", "a slightly aquiline nose", "a narrow nose bridge", "a softly rounded nose", "a refined straight nose", "a gently curved nose", "a broad nose", "a small straight nose", "a slightly hooked nose"];
const BROW = ["full eyebrows", "neatly groomed medium eyebrows", "softly arched eyebrows", "straight eyebrows", "fine well-shaped eyebrows", "thick dark eyebrows", "light slim eyebrows"];
const LIPS = ["full lips", "medium lips", "a thin upper lip", "a wide mouth", "balanced lips", "a small mouth"];
const SKIN: Record<string, string[]> = {
  arab: ["a light olive skin tone", "a medium olive skin tone", "a warm tan skin tone", "a sun-kissed tan complexion", "a light golden-brown complexion", "a fair olive complexion", "a deep olive complexion", "a warm bronze complexion"],
  european: ["a fair complexion", "a light rosy complexion", "a lightly tanned complexion", "a light olive complexion", "a neutral fair complexion", "a pale complexion"],
  eastasian: ["a fair porcelain complexion", "a light warm complexion", "a light ivory complexion", "a softly tanned light complexion"],
  southasian: ["a light brown complexion", "a wheatish-brown complexion", "a medium brown complexion", "a warm tan-brown complexion", "a deep brown complexion"],
  namerica: ["a fair complexion", "a light tan complexion", "a light olive complexion", "a medium tan complexion", "a warm brown complexion"],
  neutral: ["a light complexion", "a medium complexion", "a light tan complexion"],
};
const EYES_ASIAN = ["almond monolid eyes", "gently hooded almond eyes", "warm almond eyes with a subtle double eyelid", "narrow calm eyes"];
const EYES = ["almond-shaped eyes", "slightly hooded eyes", "deep-set eyes", "wide-set expressive eyes", "calm rounded eyes", "narrow focused eyes", "large expressive eyes"];
const MHAIR = ["short neatly combed hair", "a short professional side-part", "a clean low-fade crop", "short slicked-back hair", "a neat textured crop", "short combed-back hair", "a tidy short curly cut"];
const MBEARD = ["clean-shaven", "light short stubble", "a short neatly trimmed beard", "a well-groomed short full beard", "a trimmed goatee", "a neat moustache with light stubble", "a thick groomed full beard", "a short boxed beard", "designer stubble"];
const FHAIR = ["a neat shoulder-length style", "a low professional bun", "a sleek shoulder-length cut", "a tidy tied-back style"];
const SHAYLA = ["a softly draped premium black shayla framing the face", "a neatly wrapped premium black shayla", "an elegantly folded premium black shayla", "a smoothly draped refined black shayla"];
const HAIRCOL = ["black", "dark brown", "brown"];

/* Extremely subtle, deterministic photographic micro-variation — so 80+ portraits
 * read as 80 different real people, never the same person re-rendered, while still
 * looking shot by one government photographer in one studio. All variation is tiny. */
const TILT = ["head held straight", "an almost imperceptible head tilt to the left", "an almost imperceptible head tilt to the right", "a very slight natural head tilt"];
const SHOULDER = ["shoulders squared to the camera", "shoulders turned very slightly to the left", "shoulders turned very slightly to the right", "a subtle three-quarter shoulder angle"];
const EYELINE = ["eyes looking directly into the lens", "a steady gaze just barely off-axis yet still toward the camera", "a calm direct gaze toward the camera"];
const EXPR = ["a calm neutral expression", "a quietly confident expression", "a subtly approachable expression", "a composed serious executive expression"];
const BROWPOS = ["relaxed eyebrows", "very slightly raised eyebrows", "softly settled eyebrows"];
const LIPTENSION = ["relaxed lips gently closed", "a softly closed mouth", "minimal natural lip tension", "calmly set lips"];
const JAWTENSION = ["a relaxed jaw", "a subtly set jaw", "a lightly firmed jawline"];

/** Server-side prompt — a complete executive identity profile: unique deterministic
 * facial features, realistic capped age, nationality-matched ethnicity, role/nationality
 * attire and one consistent government-studio style. */
function buildServerPrompt(b: GenBody): string {
  const id = b.employeeId || b.key || [b.name, b.gender, b.nationality, b.department].filter(Boolean).join("|") || "anon";
  const iso = (b.nationality ?? "AE").toUpperCase();
  const emirati = iso === "AE";
  const female = b.gender === "female";
  const role = b.role ?? "";
  const grp = ethGroup(iso);
  const age = ageOf(id, role);

  const attire = /driver|chauffeur/i.test(role)
    ? "a clean professional UAE-government chauffeur uniform, plain with no badges or insignia"
    : /security|guard|protection/i.test(role) && !emirati
      ? "a formal dark government security-service uniform with subtle insignia"
      : emirati
        ? female
          ? "an elegant black abaya of premium fabric with a refined neatly draped black shayla, a simple executive appearance, minimal makeup and no jewelry beyond very subtle earrings"
          : "a perfectly pressed pristine white Emirati kandura of premium fabric, a clean crisp white ghutra and an elegant black agal, no decorations"
        : female
          ? "a refined tailored dark formal executive business suit"
          : "a refined tailored dark navy executive business suit with a crisp white shirt and a conservative tie";

  const skin = pick(id, "skin", SKIN[grp]);
  const eyes = pick(id, "eyes", grp === "eastasian" ? EYES_ASIAN : EYES);
  const features = [pick(id, "face", FACE), pick(id, "jaw", JAW), eyes, pick(id, "nose", NOSE), pick(id, "brow", BROW), pick(id, "lips", LIPS), skin];
  const hairColor = pick(id, "hair-col", HAIRCOL);
  if (!female && !emirati) features.push(`${hairColor} ${pick(id, "hair", MHAIR)}`, pick(id, "beard", MBEARD));
  else if (!female && emirati) features.push(pick(id, "beard", MBEARD)); // hair under the ghutra; beard varies
  else if (female && emirati) features.push(pick(id, "shayla", SHAYLA));
  else features.push(`${hairColor} ${pick(id, "fhair", FHAIR)}`); // non-Gulf woman, hair visible
  if (fnv(id + "|glasses") % 100 < 14) features.push("wearing thin modern professional eyeglasses");

  // Deterministic, extremely subtle pose + expression micro-variation (per employeeId).
  const pose = [
    pick(id, "tilt", TILT), pick(id, "shoulder", SHOULDER), pick(id, "eyeline", EYELINE),
    pick(id, "expr", EXPR), pick(id, "browpos", BROWPOS), pick(id, "lip", LIPTENSION), pick(id, "jawt", JAWTENSION),
  ].join(", ");

  return [
    `Professional government executive ID portrait of a ${age}-year-old ${ethOf(b.nationality)} ${female ? "woman" : "man"}`,
    `a unique distinct individual with clearly individual features that never resemble a sibling, twin or relative of any other employee, with ${features.join(", ")}`,
    `wearing ${attire}`,
    `executive headshot framing showing the head and upper shoulders with comfortable space around the head, not cropped too tightly, in the style of a corporate Microsoft 365 executive profile photo, ${pose}, the pose and expression varied only extremely subtly and naturally, still looking toward the camera, never smiling broadly, never angry, never emotional`,
    "soft natural government-studio lighting with gently reduced contrast and no dramatic shadows, 85mm portrait lens, sharp focus, natural realistic skin texture, a real professional confident approachable government employee, not a fashion model and not glamorous, youthful to middle-aged adult, no wrinkles, no aged or elderly features",
    "official government employee studio headshot photographed by one consistent government studio photographer, ultra-realistic photograph, high resolution, not fashion photography, not cinematic, no dramatic shadows, no AI artifacts. Plain seamless light-grey studio backdrop only. No flags, no emblems, no banners, no logos, no text, no buildings, no scenery, no furniture behind the subject",
  ].join(", ");
}

// Serve generated portraits (stable URLs, long-lived browser cache).
router.use("/portraits/files", express.static(PORTRAITS_DIR, { immutable: true, maxAge: "30d" }));

router.post("/portraits/generate", async (req, res) => {
  const b = (req.body ?? {}) as GenBody;
  // Portrait OWNERSHIP is the stable employeeId (never order/index/name).
  const id =
    b.employeeId ||
    b.key ||
    (b.name ? [b.name, b.gender, b.nationality, b.department].filter(Boolean).join("|") : "");
  if (!id) {
    res.status(400).json({ error: "identity key required" });
    return;
  }

  const file = `${stableName(id)}.png`;
  const filePath = path.join(PORTRAITS_DIR, file);
  const url = `/api/portraits/files/${file}`;

  // Requirement: same portrait every time, never regenerate once it exists.
  if (fs.existsSync(filePath)) {
    res.json({ url, cached: true });
    return;
  }

  if (!hasProviderKey()) {
    res.status(503).json({ error: "portrait provider not configured" });
    return;
  }

  const prompt = (b.prompt && b.prompt.trim()) || buildServerPrompt(b);
  try {
    fs.mkdirSync(PORTRAITS_DIR, { recursive: true });
    const buf = await generatePortrait(prompt);
    fs.writeFileSync(filePath, buf);
    res.json({ url, cached: false });
  } catch (err) {
    req.log.error({ err }, "portrait generation failed");
    res.status(502).json({ error: "portrait generation failed" });
  }
});

export default router;
