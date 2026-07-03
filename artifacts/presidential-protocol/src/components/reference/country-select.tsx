import { useMemo, useState } from "react";
import { ChevronDown, Search, Check, Globe } from "lucide-react";
import {
  searchCountries,
  getCountry,
  type Country,
} from "@workspace/reference";
import { CountryFlag } from "@/components/reference/country-flag";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/i18n/language-context";
import { palette } from "@/theme";

const C = palette;

/**
 * Luxury country picker backed by the shared reference dataset. Shows the flag,
 * localized name, capital and region. RTL-aware (Arabic name first in ar mode).
 * Emits the selected ISO alpha-2 code via `onChange`.
 */
export function CountrySelect({
  value,
  onChange,
  placeholder,
}: {
  value: string | null | undefined;
  onChange: (code: string | null, country: Country | null) => void;
  placeholder?: string;
}) {
  const { t } = useTranslation();
  const { lang, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = getCountry(value);
  const results = useMemo(() => searchCountries(query, 40), [query]);

  const nameOf = (c: Country) => (lang === "en" ? c.nameEn : c.nameAr);
  const capitalOf = (c: Country) => (lang === "en" ? c.capital : c.capitalAr);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-muted/30"
          style={{ borderColor: C.border }}
        >
          {selected ? (
            <span className="flex items-center gap-2 min-w-0">
              <CountryFlag value={selected.code} size={16} />
              <span className="truncate text-foreground">{nameOf(selected)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Globe size={14} strokeWidth={1.5} />
              {placeholder ?? t("reference.country.placeholder")}
            </span>
          )}
          <ChevronDown size={15} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0" dir={dir}>
        <div className="flex items-center gap-2 border-b px-3 py-2" style={{ borderColor: C.border }}>
          <Search size={14} strokeWidth={1.5} className="text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("reference.country.search")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            dir={dir}
          />
        </div>
        <ScrollArea className="max-h-72">
          <div className="p-1">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                {t("reference.country.noResults")}
              </p>
            ) : (
              results.map((c) => {
                const active = selected?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => { onChange(c.code, c); setOpen(false); setQuery(""); }}
                    className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start transition-colors hover:bg-muted/50"
                    style={active ? { background: C.sunset + "33" } : undefined}
                  >
                    <CountryFlag value={c.code} size={18} className="shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-foreground truncate">{nameOf(c)}</span>
                      <span className="block text-[11px] text-muted-foreground truncate">
                        {capitalOf(c)} · {c.region} · {c.code}
                      </span>
                    </span>
                    {active && <Check size={14} strokeWidth={2} style={{ color: C.mangrove }} className="shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
