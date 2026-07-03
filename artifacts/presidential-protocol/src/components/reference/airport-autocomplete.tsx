import { useMemo, useRef, useState } from "react";
import { Plane, Search } from "lucide-react";
import { searchAirports, type Airport } from "@workspace/reference";
import { CountryFlag } from "@/components/reference/country-flag";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { palette } from "@/theme";

const C = palette;

/**
 * Smart airport autocomplete backed by the shared reference dataset. Shows
 * IATA code, airport name, city, country and flag. RTL-aware. Manual entry is
 * preserved — the field accepts any typed text; picking a suggestion fills the
 * IATA code and reports the resolved airport.
 */
export function AirportAutocomplete({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const results = useMemo(() => searchAirports(value, 8), [value]);
  const cityOf = (a: Airport) => (lang === "en" ? a.cityEn : a.cityAr || a.cityEn);
  const nameOf = (a: Airport) => (lang === "en" ? a.nameEn : a.nameAr || a.nameEn);

  return (
    <div className="relative">
      <div className="relative">
        <Search
          size={14}
          strokeWidth={1.5}
          className="absolute top-1/2 -translate-y-1/2 text-muted-foreground/50"
          style={{ insetInlineStart: 10 }}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { blurTimer.current = setTimeout(() => setFocused(false), 150); }}
          placeholder={placeholder ?? t("reference.airport.placeholder")}
          dir={dir}
          className="w-full h-10 rounded-md border bg-background ps-8 pe-3 text-sm outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
          style={{ borderColor: C.border }}
        />
      </div>
      {focused && results.length > 0 && (
        <div
          className="absolute z-50 mt-1 w-full rounded-xl border bg-popover shadow-lg overflow-hidden"
          style={{ borderColor: C.border, boxShadow: C.shadowLg }}
          onMouseDown={() => { if (blurTimer.current) clearTimeout(blurTimer.current); }}
          dir={dir}
        >
          <div className="max-h-72 overflow-y-auto p-1">
            {results.map((a) => (
              <button
                key={a.iata}
                type="button"
                onClick={() => { onChange(a.iata, a); setFocused(false); }}
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-muted/50"
              >
                <span
                  className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md text-[11px] font-bold tracking-wide"
                  style={{ background: C.sunset + "44", color: C.castleHill }}
                >
                  {a.iata}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground truncate">{nameOf(a)}</span>
                  <span className="block text-[11px] text-muted-foreground truncate">
                    <CountryFlag value={a.countryCode} size={11} /> {cityOf(a)}
                  </span>
                </span>
                <Plane size={13} strokeWidth={1.5} className="shrink-0 text-muted-foreground/40" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
