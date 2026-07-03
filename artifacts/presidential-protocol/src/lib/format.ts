/**
 * Shared formatting helpers.
 *
 * `formatCurrency` consolidates the (previously duplicated) `fmtMoney` /
 * `fmtMoneyShort` helpers used across the dashboard, reports, executive report,
 * and event command center. Behavior matches the originals: AED-default
 * fallback, integer dirhams, ar-AE / en-AE locale, and a graceful non-throwing
 * fallback for unknown currency codes.
 */
export function formatCurrency(
  amount: number,
  currency: string | undefined,
  lang: string,
): string {
  const cur = currency || "AED";
  try {
    return new Intl.NumberFormat(lang === "ar" ? "ar-AE" : "en-AE", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${cur}`;
  }
}
