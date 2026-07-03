import { palette } from "@/theme";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LogisticsSection } from "./logistics/section";
import { LOGISTICS_CONFIGS, type LogisticsKey } from "./logistics/configs";

const T = palette;

const ORDER: LogisticsKey[] = ["travel", "hotel", "fleet", "gifts", "budget", "documents"];

export function LogisticsTab({ eventId }: { eventId: number }) {
  const { t } = useTranslation();
  const [sub, setSub] = useState<LogisticsKey>("travel");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 border-b justify-end" style={{ borderColor: T.border }}>
        {ORDER.map((key) => {
          const cfg = LOGISTICS_CONFIGS[key];
          const active = sub === key;
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setSub(key)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative"
              style={{ color: active ? T.mangrove : T.warmGray }}
            >
              <Icon size={15} strokeWidth={1.5} />
              {t(`pages.commandCenter.logistics.sub.${key}`)}
              {active && (
                <span className="absolute bottom-0 start-0 end-0 h-0.5 rounded-full" style={{ background: T.mangrove }} />
              )}
            </button>
          );
        })}
      </div>

      <LogisticsSection key={sub} eventId={eventId} config={LOGISTICS_CONFIGS[sub]} />
    </div>
  );
}
