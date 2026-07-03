import { useState } from "react";

const COLORS = {
  floralWhite: "#FCF7EE",
  castleHill: "#3D3529",
  mangrove: "#3D7A5C",
  calmTeal: "#5B8F8A",
  mediumWood: "#8B6B3D",
  sunset: "#E8C49A",
  sunsetLight: "#F5E8D5",
  warmGray: "#9E9086",
  parchment: "#F2EDE4",
};

function CircularProgress({ pct, color, label, sublabel }: { pct: number; color: string; label: string; sublabel: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#E8DDD0" strokeWidth="3" />
          <circle
            cx="32" cy="32" r={r}
            fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
        </svg>
        <span style={{ color, fontFamily: "serif" }} className="absolute inset-0 flex items-center justify-center text-xs font-bold">
          {pct}%
        </span>
      </div>
      <p className="text-center text-xs font-medium" style={{ color: COLORS.castleHill }}>{label}</p>
      <p className="text-center text-[10px]" style={{ color: COLORS.warmGray }}>{sublabel}</p>
    </div>
  );
}

function KpiCard({ icon, value, label, sublabel, accent }: { icon: string; value: string; label: string; sublabel: string; accent: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 border"
      style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "0 1px 4px rgba(61,53,41,0.05)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base"
          style={{ background: accent + "22", color: accent }}
        >
          {icon}
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: COLORS.sunsetLight, color: COLORS.mediumWood }}>
          اليوم
        </span>
      </div>
      <div className="text-right">
        <div className="text-3xl font-bold" style={{ color: COLORS.castleHill, fontFamily: "Georgia, serif" }}>{value}</div>
        <div className="text-sm font-semibold mt-0.5" style={{ color: COLORS.castleHill }}>{label}</div>
        <div className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>{sublabel}</div>
      </div>
    </div>
  );
}

function VisitRow({ flag, name, country, date, status }: { flag: string; name: string; country: string; date: string; status: string }) {
  const statusStyle = status === "مؤكد"
    ? { background: COLORS.mangrove + "18", color: COLORS.mangrove }
    : { background: COLORS.sunset + "44", color: COLORS.mediumWood };
  return (
    <div className="flex items-center justify-between py-3.5 border-b last:border-0" style={{ borderColor: "#EBE3D8" }}>
      <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={statusStyle}>{status}</span>
      <div className="text-right flex-1 mx-4">
        <p className="text-sm font-semibold" style={{ color: COLORS.castleHill }}>{name}</p>
        <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>{country} · {date}</p>
      </div>
      <span className="text-xl">{flag}</span>
    </div>
  );
}

function ApprovalRow({ title, by, urgent }: { title: string; by: string; urgent?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: "#EBE3D8" }}>
      <div className="flex flex-col items-center gap-1.5 ms-1">
        <button
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:scale-105"
          style={{ background: COLORS.mangrove, color: "#fff" }}
        >✓</button>
        <button
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all hover:scale-105"
          style={{ borderColor: "#D0C5B8", color: COLORS.warmGray }}
        >✕</button>
      </div>
      <div className="flex-1 text-right">
        <div className="flex items-center justify-end gap-2">
          {urgent && (
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "#FEE2E2", color: "#DC2626" }}>عاجل</span>
          )}
          <p className="text-sm font-semibold" style={{ color: COLORS.castleHill }}>{title}</p>
        </div>
        <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>بواسطة: {by}</p>
      </div>
    </div>
  );
}

function SidebarIcon({ icon, active, label }: { icon: string; active?: boolean; label: string }) {
  return (
    <div title={label} className="relative group">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-base cursor-pointer transition-all hover:scale-105"
        style={{
          background: active ? COLORS.mangrove : "transparent",
          color: active ? "#fff" : COLORS.warmGray,
        }}
      >
        {icon}
      </div>
    </div>
  );
}

export function LuxuryDashboard() {
  const [activeNav] = useState("home");

  return (
    <div
      className="flex min-h-screen w-full"
      dir="rtl"
      style={{ background: COLORS.floralWhite, fontFamily: "'Noto Sans Arabic', sans-serif" }}
    >
      {/* ── RIGHT SIDEBAR ── */}
      <aside
        className="fixed right-0 top-0 bottom-0 w-[72px] flex flex-col items-center py-6 gap-5 border-s z-50"
        style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "−2px 0 12px rgba(61,53,41,0.04)" }}
      >
        {/* Logo */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold mb-2"
          style={{ background: COLORS.mangrove, color: "#fff" }}
        >
          ♛
        </div>
        <SidebarIcon icon="⌂" active label="الرئيسية" />
        <SidebarIcon icon="📅" label="الفعاليات" />
        <SidebarIcon icon="✈" label="الزيارات" />
        <SidebarIcon icon="✓" label="الموافقات" />
        <SidebarIcon icon="★" label="كبار الشخصيات" />
        <SidebarIcon icon="✉" label="الدعوات" />
        <SidebarIcon icon="◫" label="التقويم" />
        <SidebarIcon icon="▤" label="التقارير" />
        <div className="mt-auto">
          <SidebarIcon icon="⚙" label="الإعدادات" />
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 me-[72px] flex flex-col">
        {/* TOP HEADER */}
        <header
          className="h-16 flex items-center justify-between px-8 border-b sticky top-0 z-40"
          style={{ background: "rgba(252,247,238,0.9)", backdropFilter: "blur(12px)", borderColor: "#EBE3D8" }}
        >
          {/* Search (appears on right in RTL) */}
          <div className="relative w-72">
            <span className="absolute end-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: COLORS.warmGray }}>⌕</span>
            <input
              placeholder="بحث في الفعاليات والزيارات..."
              className="w-full rounded-full border pe-9 ps-4 py-2 text-sm outline-none transition-all"
              style={{
                background: "#fff",
                borderColor: "#E0D8CE",
                color: COLORS.castleHill,
                fontFamily: "'Noto Sans Arabic', sans-serif",
              }}
            />
          </div>
          {/* Right controls — appear on LEFT in RTL */}
          <div className="flex items-center gap-5">
            <div className="text-sm font-medium" style={{ color: COLORS.warmGray }}>
              الخميس، 14 مايو 2026
            </div>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
              style={{ borderColor: "#EBE3D8", color: COLORS.mediumWood, background: COLORS.sunsetLight }}
            >
              ☀ أبوظبي 28°
            </div>
            <button className="relative" style={{ color: COLORS.warmGray }}>
              🔔
              <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full" style={{ background: "#DC2626" }} />
            </button>
            <div className="flex items-center gap-2.5 ps-4 border-s" style={{ borderColor: "#EBE3D8" }}>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: COLORS.castleHill }}>فاطمة درويش</p>
                <p className="text-xs" style={{ color: COLORS.warmGray }}>مديرة البروتوكول</p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: COLORS.mangrove, color: "#fff" }}
              >
                ف.د
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 p-8 space-y-8">

          {/* HERO SECTION */}
          <div
            className="relative rounded-3xl overflow-hidden"
            style={{ minHeight: 200 }}
          >
            {/* Background: palace-inspired warm gradient + subtle pattern */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${COLORS.castleHill} 0%, ${COLORS.mediumWood} 40%, ${COLORS.calmTeal} 100%)`,
              }}
            />
            {/* Geometric motif overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.15) 20px, rgba(255,255,255,0.15) 21px), repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.08) 20px, rgba(255,255,255,0.08) 21px)`,
              }}
            />
            {/* Palace arch silhouette */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-10"
              style={{
                background: "radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.4) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Greeting — right side in RTL */}
              <div className="text-right">
                <p className="text-sm font-medium mb-1" style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.05em" }}>
                  منصة البروتوكول الرئاسي
                </p>
                <h1
                  className="text-4xl md:text-5xl font-bold text-white mb-2"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif", textShadow: "0 2px 12px rgba(0,0,0,0.2)" }}
                >
                  مرحباً فاطمة
                </h1>
                <p className="text-base text-white/75 font-light italic">
                  نظرة عامة على فعالياتك اليوم
                </p>
              </div>

              {/* Info cards — left side in RTL */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Date */}
                <div
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border text-right"
                  style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                >
                  <div className="text-white/60 text-xl">📅</div>
                  <div>
                    <p className="text-xs text-white/60">التاريخ</p>
                    <p className="text-sm font-semibold text-white">14 مايو 2026</p>
                  </div>
                </div>
                {/* Weather */}
                <div
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border text-right"
                  style={{ background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                >
                  <div className="text-white/60 text-xl">☀</div>
                  <div>
                    <p className="text-xs text-white/60">أبوظبي</p>
                    <p className="text-sm font-semibold text-white">28°C مشمس</p>
                  </div>
                </div>
                {/* Prayer */}
                <div
                  className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border text-right"
                  style={{ background: "rgba(255,255,255,0.15)", borderColor: "rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}
                >
                  <div className="text-white/70 text-xl">🕌</div>
                  <div>
                    <p className="text-xs text-white/60">الصلاة القادمة</p>
                    <p className="text-sm font-semibold text-white">المغرب 05:02 م</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCard icon="📅" value="3" label="الفعاليات القادمة" sublabel="+2% من الشهر الماضي" accent={COLORS.mangrove} />
            <KpiCard icon="✈" value="2" label="الزيارات الرسمية" sublabel="+0% من الشهر الماضي" accent={COLORS.calmTeal} />
            <KpiCard icon="⊘" value="2" label="طلبات معلقة" sublabel="-1% من الشهر الماضي" accent={COLORS.mediumWood} />
            <KpiCard icon="✓" value="3" label="موافقات مطلوبة" sublabel="يجب مراجعتها اليوم" accent="#DC2626" />
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN (2/3) */}
            <div className="lg:col-span-2 space-y-6">

              {/* EVENT READINESS TRACKER */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "0 1px 4px rgba(61,53,41,0.05)" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <button className="text-xs font-medium" style={{ color: COLORS.mangrove }}>عرض الكل ‹</button>
                  <div className="text-right">
                    <h2 className="text-lg font-bold" style={{ color: COLORS.castleHill, fontFamily: "Georgia, serif" }}>
                      جاهزية الفعالية
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: COLORS.warmGray }}>قمة التعاون الخليجي — 26 مايو 2026</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  <CircularProgress pct={92} color={COLORS.mangrove} label="البروتوكول" sublabel="22/24" />
                  <CircularProgress pct={85} color={COLORS.calmTeal} label="الضيافة" sublabel="17/20" />
                  <CircularProgress pct={70} color={COLORS.mediumWood} label="النقل" sublabel="14/20" />
                  <CircularProgress pct={95} color={COLORS.mangrove} label="الأمن" sublabel="19/20" />
                  <CircularProgress pct={60} color="#E8A838" label="الدعوات" sublabel="12/20" />
                  <CircularProgress pct={40} color="#DC2626" label="الإعلام" sublabel="8/20" />
                </div>
                {/* Overall bar */}
                <div className="mt-6 pt-5 border-t" style={{ borderColor: "#EBE3D8" }}>
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-bold" style={{ color: COLORS.mangrove, fontFamily: "Georgia, serif" }}>74%</span>
                    <span className="font-semibold" style={{ color: COLORS.castleHill }}>الجاهزية الإجمالية</span>
                  </div>
                  <div className="h-2 w-full rounded-full" style={{ background: "#EBE3D8" }}>
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: "74%", background: `linear-gradient(to left, ${COLORS.mangrove}, ${COLORS.calmTeal})` }}
                    />
                  </div>
                </div>
              </div>

              {/* UPCOMING EVENTS */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "0 1px 4px rgba(61,53,41,0.05)" }}
              >
                <div className="flex items-center justify-between mb-5">
                  <button className="text-xs font-medium" style={{ color: COLORS.mangrove }}>عرض الكل ‹</button>
                  <h2 className="text-lg font-bold" style={{ color: COLORS.castleHill, fontFamily: "Georgia, serif" }}>
                    الفعاليات القادمة
                  </h2>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "قمة التعاون الخليجي", location: "قصر الرئاسة · أبوظبي", date: "26 مايو", pct: 74, status: "مؤكد" },
                    { name: "استقبال الوفد الأمريكي", location: "قصر الضيافة · أبوظبي", date: "27 مايو", pct: 52, status: "مسودة" },
                    { name: "حفل اليوم الوطني", location: "مسرح أبوظبي الوطني", date: "2 ديسمبر", pct: 30, status: "مسودة" },
                  ].map((ev) => (
                    <div
                      key={ev.name}
                      className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all hover:shadow-sm"
                      style={{ border: `1px solid #EBE3D8`, background: COLORS.floralWhite }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={ev.status === "مؤكد"
                                ? { background: COLORS.mangrove + "18", color: COLORS.mangrove }
                                : { background: COLORS.sunset + "55", color: COLORS.mediumWood }}
                            >{ev.status}</span>
                            <p className="text-sm font-semibold" style={{ color: COLORS.castleHill }}>{ev.name}</p>
                          </div>
                          <p className="text-xs mt-1" style={{ color: COLORS.warmGray }}>{ev.location}</p>
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: COLORS.mangrove + "15", color: COLORS.mangrove }}
                        >📅</div>
                      </div>
                      <div className="flex flex-col items-start gap-1.5 min-w-[90px]">
                        <div className="text-xs font-bold" style={{ color: COLORS.mangrove }}>{ev.pct}%</div>
                        <div className="h-1.5 w-full rounded-full" style={{ background: "#EBE3D8" }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${ev.pct}%`, background: COLORS.mangrove }}
                          />
                        </div>
                        <div className="text-xs" style={{ color: COLORS.warmGray }}>{ev.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OFFICIAL VISITS */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "0 1px 4px rgba(61,53,41,0.05)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <button className="text-xs font-medium" style={{ color: COLORS.mangrove }}>عرض الكل ‹</button>
                  <h2 className="text-lg font-bold" style={{ color: COLORS.castleHill, fontFamily: "Georgia, serif" }}>
                    الزيارات الرسمية
                  </h2>
                </div>
                <VisitRow flag="🇸🇦" name="وفد المملكة العربية السعودية" country="المملكة العربية السعودية" date="18 مايو" status="مؤكد" />
                <VisitRow flag="🇫🇷" name="الوفد الفرنسي الرسمي" country="فرنسا" date="22 مايو" status="مؤكد" />
                <VisitRow flag="🇯🇵" name="الوفد الياباني للتعاون" country="اليابان" date="1 يونيو" status="قيد الانتظار" />
              </div>
            </div>

            {/* RIGHT COLUMN (1/3) */}
            <div className="space-y-6">

              {/* AI ASSISTANT */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  background: `linear-gradient(160deg, ${COLORS.castleHill} 0%, ${COLORS.mangrove} 100%)`,
                  borderColor: "transparent",
                  boxShadow: "0 4px 20px rgba(61,53,41,0.15)",
                }}
              >
                <div className="text-right mb-5">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <h2 className="text-base font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
                      المساعد الذكي
                    </h2>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                      ✦
                    </div>
                  </div>
                  <p className="text-xs text-white/60">توصيات البروتوكول اليوم</p>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: "⚠", text: "مستوى المخاطر مرتفع في الجانب الأمني لقمة الطاقة. يُرجى مراجعة التصاريح.", urgent: true },
                    { icon: "📋", text: "3 مهام متأخرة في جاهزية حفل اليوم الوطني تحتاج إلى متابعة." },
                    { icon: "✉", text: "تم اكتمال 90% من الدعوات للمؤتمر السنوي. يمكن إرسال التذكيرات الآن." },
                  ].map((insight, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl text-right"
                      style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.12)" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs"
                        style={{ background: insight.urgent ? "rgba(220,38,38,0.3)" : "rgba(255,255,255,0.15)" }}
                      >
                        {insight.icon}
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">{insight.text}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  عرض جميع التوصيات
                </button>
              </div>

              {/* APPROVALS */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "0 1px 4px rgba(61,53,41,0.05)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <button className="text-xs font-medium" style={{ color: COLORS.mangrove }}>عرض الكل ‹</button>
                  <h2 className="text-base font-bold" style={{ color: COLORS.castleHill, fontFamily: "Georgia, serif" }}>
                    الموافقات المعلقة
                  </h2>
                </div>
                <ApprovalRow title="موافقة بروتوكول الرئيس الفرنسي" by="نورة الكعبي" urgent />
                <ApprovalRow title="موافقة ميزانية حفل اليوم الوطني" by="محمد الحمداني" />
                <ApprovalRow title="موافقة عقد التموين" by="لطيفة العمير" />
              </div>

              {/* QUICK EXPORT */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#fff", borderColor: "#EBE3D8", boxShadow: "0 1px 4px rgba(61,53,41,0.05)" }}
              >
                <h2 className="text-base font-bold text-right mb-4" style={{ color: COLORS.castleHill, fontFamily: "Georgia, serif" }}>
                  تصدير سريع
                </h2>
                <div className="space-y-2">
                  {[
                    { label: "التقرير الشهري", format: "PDF" },
                    { label: "قائمة الضيوف", format: "Excel" },
                    { label: "جدول الفعاليات", format: "CSV" },
                    { label: "سجل الحضور", format: "PDF" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all hover:shadow-sm"
                      style={{ borderColor: "#EBE3D8", background: COLORS.floralWhite }}
                    >
                      <span
                        className="text-xs px-2 py-0.5 rounded font-mono font-bold"
                        style={{ background: COLORS.sunset + "55", color: COLORS.mediumWood }}
                      >{item.format}</span>
                      <span className="font-medium" style={{ color: COLORS.castleHill }}>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
