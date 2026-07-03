import { useState } from "react";
import { getCountry, COUNTRIES, flagEmoji, flagUrl } from "@workspace/reference";

/**
 * Renders a country flag as a crisp SVG image (works on every OS, unlike flag
 * *emoji* which Windows renders as a 2-letter code). Accepts a country code OR
 * a free-text country name (EN/AR). Falls back to the emoji if the image can't
 * load (offline). Returns null when the value can't be resolved.
 */
export function CountryFlag({
  value,
  className,
  size = 16,
}: {
  value?: string | null;
  className?: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  if (!value) return null;
  const v = value.trim();
  const country =
    getCountry(v) ??
    COUNTRIES.find((c) => c.nameEn.toLowerCase() === v.toLowerCase() || c.nameAr === v);
  if (!country) return null;

  if (errored) {
    return <span className={className} style={{ fontSize: size }}>{flagEmoji(country.code)}</span>;
  }
  return (
    <img
      src={flagUrl(country.code)}
      alt={country.code}
      title={country.code}
      loading="lazy"
      onError={() => setErrored(true)}
      className={className}
      style={{ width: size * 1.35, height: size, objectFit: "cover", borderRadius: 2, display: "inline-block", verticalAlign: "middle", boxShadow: "0 0 0 0.5px rgba(0,0,0,0.08)" }}
    />
  );
}
