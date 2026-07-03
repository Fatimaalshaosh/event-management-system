import type { SimScenario } from "./types";

/** What-if scenarios for the readiness simulator (demo deltas). */
export function buildScenarios(): SimScenario[] {
  return [
    { key: "logistics100", label: { en: "If Logistics reaches 100%", ar: "إذا بلغت اللوجستيات ١٠٠٪" }, deltaReadiness: 6, active: false },
    { key: "airportCleared", label: { en: "If airport clearance is approved", ar: "إذا اعتُمد تصريح المطار" }, deltaReadiness: 8, active: false },
    { key: "guestList", label: { en: "If the guest list is confirmed", ar: "إذا تأكدت قائمة الضيوف" }, deltaReadiness: 5, active: false },
    { key: "budget", label: { en: "If the budget is approved", ar: "إذا اعتُمدت الميزانية" }, deltaReadiness: 4, active: false },
    { key: "mediaDelayed", label: { en: "If media approval is delayed", ar: "إذا تأخر اعتماد الإعلام" }, deltaReadiness: -12, active: false },
  ];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

/** Apply the active scenarios to a base readiness. */
export function simulateReadiness(base: number, scenarios: SimScenario[]): number {
  return clamp(base + scenarios.filter((s) => s.active).reduce((sum, s) => sum + s.deltaReadiness, 0));
}
