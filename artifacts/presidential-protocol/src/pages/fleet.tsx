
import { useState } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useRegisterPageContext } from "@/ai/page-context";
import { ContextualCopilot } from "@/ai/contextual-copilot";
import { Car, Users, Route, AlertTriangle, Wrench, Download, Printer, CheckCircle, Clock, AlertCircle, Phone, MapPin, ClipboardList } from "lucide-react";

import { C, VehicleStatus, DriverStatus, Maintenance, VEHICLES, DRIVERS, ASSIGNMENTS, VIOLATIONS, MAINTENANCE, VEHICLE_STATUS_COLORS, DRIVER_STATUS_COLORS, ASSIGNMENT_STATUS_COLORS, VIOLATION_STATUS_COLORS, VEHICLE_STATUS_KEYS, DRIVER_STATUS_KEYS, ASSIGNMENT_STATUS_KEYS, VIOLATION_STATUS_KEYS, StatusPill, RatingDots, KpiCard, SectionHeader } from "@/components/fleet/shared";
import { InspectionTab, INSPECTION_REPORTS } from "@/components/fleet/inspection";

function VehiclesTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "الكل">("الكل");

  const filtered = VEHICLES.filter(v =>
    (statusFilter === "الكل" || v.status === statusFilter) &&
    (!search || v.plate.includes(search) || v.make.includes(search) || v.type.includes(search))
  );

  const statuses: Array<VehicleStatus | "الكل"> = ["الكل", "متاحة", "مخصصة", "قيد الصيانة", "خارج الخدمة"];

  return (
    <div>
      <SectionHeader title={t("pages.fleet.tabs.vehicles")} addLabel={t("pages.fleet.addVehicle")} onAdd={() => {}} search={search} onSearch={setSearch} />

      {/* Status filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "flex-start" }}>
        {statuses.map(s => {
          const active = statusFilter === s;
          const colors = s !== "الكل" ? VEHICLE_STATUS_COLORS[s as VehicleStatus] : null;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: "5px 14px", borderRadius: 999, border: `1.5px solid ${active ? (colors?.dot || C.gold) : C.border}`, background: active ? (colors?.bg || `${C.gold}15`) : "transparent", color: active ? (colors?.text || C.gold) : C.sub, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {s === "الكل" ? t("pages.fleet.filterAll") : t(VEHICLE_STATUS_KEYS[s as VehicleStatus])}
            </button>
          );
        })}
      </div>

      {/* Vehicles grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
        {filtered.map((v, i) => {
          const sc = VEHICLE_STATUS_COLORS[v.status];
          const isExpired = v.insurance < "2025/06/15";
          return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow, textAlign: "end", cursor: "pointer", transition: "box-shadow 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowMd}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow}
            >
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <StatusPill label={t(VEHICLE_STATUS_KEYS[v.status])} colors={sc} />
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{v.plate}</p>
                  <p style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{v.make}</p>
                </div>
              </div>

              {/* Type tag */}
              <div style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 8, background: C.border, marginBottom: 14 }}>
                <span style={{ fontSize: 10, color: C.sub, fontWeight: 600 }}>{v.type}</span>
              </div>

              <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

              {/* Details */}
              {[
                { label: t("pages.fleet.fields.owner"), value: v.owner },
                { label: t("pages.fleet.fields.insuranceUntil"), value: v.insurance, warn: isExpired },
                { label: t("pages.fleet.fields.periodicInspection"), value: v.inspection },
                { label: t("pages.fleet.fields.nextService"), value: v.nextService },
              ].map(({ label, value, warn }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: warn ? "#A0481A" : C.text, fontWeight: warn ? 700 : 400 }}>
                    {warn && <AlertCircle size={11} strokeWidth={2} style={{ color: "#C85A20", display: "inline", marginInlineStart: 4 }} />}
                    {value}
                  </span>
                  <span style={{ fontSize: 10, color: C.sub }}>{label}</span>
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Drivers tab ────────────────────────────────────────────── */
function DriversTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [avail, setAvail] = useState<DriverStatus | "الكل">("الكل");

  const filtered = DRIVERS.filter(d =>
    (avail === "الكل" || d.status === avail) &&
    (!search || d.name.includes(search) || d.assignedVehicle.includes(search))
  );

  return (
    <div>
      <SectionHeader title={t("pages.fleet.tabs.drivers")} addLabel={t("pages.fleet.addDriver")} onAdd={() => {}} search={search} onSearch={setSearch} />

      <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "flex-start" }}>
        {(["الكل", "متاح", "في مهمة", "إجازة"] as const).map(s => {
          const active = avail === s;
          const colors = s !== "الكل" ? DRIVER_STATUS_COLORS[s as DriverStatus] : null;
          return (
            <button key={s} onClick={() => setAvail(s)}
              style={{ padding: "5px 14px", borderRadius: 999, border: `1.5px solid ${active ? (colors?.text || C.gold) : C.border}`, background: active ? (colors?.bg || `${C.gold}15`) : "transparent", color: active ? (colors?.text || C.gold) : C.sub, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {s === "الكل" ? t("pages.fleet.filterAll") : t(DRIVER_STATUS_KEYS[s as DriverStatus])}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
        {filtered.map((d, i) => {
          const sc = DRIVER_STATUS_COLORS[d.status];
          const licenseExpiring = d.licenseExpiry < "2025/09/01";
          return (
            <motion.div key={d.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow, textAlign: "end", cursor: "pointer", transition: "box-shadow 0.2s" }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowMd}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <StatusPill label={t(DRIVER_STATUS_KEYS[d.status])} colors={sc} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{d.name}</p>
                  <RatingDots rating={d.rating} />
                </div>
              </div>

              {/* Avatar row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, marginBottom: 14 }}>
                <div>
                  <p style={{ fontSize: 11, color: C.sub }}>{t("pages.fleet.tripsCompleted", { count: d.trips })}</p>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.teal}60, ${C.teal})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{d.name.split(" ").slice(-1)[0][0]}</span>
                </div>
              </div>

              <div style={{ height: 1, background: C.border, marginBottom: 12 }} />

              {[
                { label: t("pages.fleet.fields.licenseNumber"), value: d.license },
                { label: t("pages.fleet.fields.licenseExpiry"), value: d.licenseExpiry, warn: licenseExpiring },
                { label: t("pages.fleet.fields.assignedVehicle"), value: d.assignedVehicle },
              ].map(({ label, value, warn }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: warn ? "#A0481A" : C.text, fontWeight: warn ? 700 : 400 }}>
                    {warn && <AlertCircle size={11} strokeWidth={2} style={{ color: "#C85A20", display: "inline", marginInlineStart: 4 }} />}
                    {value}
                  </span>
                  <span style={{ fontSize: 10, color: C.sub }}>{label}</span>
                </div>
              ))}

              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                <a href={`tel:${d.phone}`} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.teal, textDecoration: "none", fontWeight: 600 }}>
                  {d.phone}
                  <Phone size={11} strokeWidth={1.5} />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Assignments tab ────────────────────────────────────────── */
function AssignmentsTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = ASSIGNMENTS.filter(a =>
    !search || a.event.includes(search) || a.driver.includes(search) || a.vehicle.includes(search)
  );

  return (
    <div>
      <SectionHeader title={t("pages.fleet.tabs.assignments")} addLabel={t("pages.fleet.addAssignment")} onAdd={() => {}} search={search} onSearch={setSearch} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((a, i) => {
          const sc = ASSIGNMENT_STATUS_COLORS[a.status];
          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 22px", boxShadow: C.shadow, textAlign: "end", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

              {/* Left: status + date */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 100 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 10, background: sc.bg }}>
                  <span style={{ color: sc.text }}>{sc.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: sc.text }}>{t(ASSIGNMENT_STATUS_KEYS[a.status])}</span>
                </div>
                <p style={{ fontSize: 10, color: C.sub }}>{a.date}</p>
              </div>

              {/* Main content */}
              <div style={{ flex: 1, textAlign: "end" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>{a.event}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
                  {[
                    { label: t("pages.fleet.fields.vehicle"), value: a.vehicle, icon: <Car size={11} strokeWidth={1.5} /> },
                    { label: t("pages.fleet.fields.driver"), value: a.driver, icon: <Users size={11} strokeWidth={1.5} /> },
                    { label: t("pages.fleet.fields.departureTime"), value: a.departure, icon: <Clock size={11} strokeWidth={1.5} /> },
                    { label: t("pages.fleet.fields.arrivalTime"), value: a.arrival, icon: <CheckCircle size={11} strokeWidth={1.5} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                      <span style={{ fontSize: 11, color: C.text }}>{value}</span>
                      <span style={{ color: C.sub }}>{icon}</span>
                      <span style={{ fontSize: 10, color: C.sub }}>{label}:</span>
                    </div>
                  ))}
                </div>
                {a.route !== "—" && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginTop: 10, padding: "6px 12px", background: C.bg, borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: C.text }}>{a.route}</span>
                    <MapPin size={11} strokeWidth={1.5} style={{ color: C.gold }} />
                    <span style={{ fontSize: 10, color: C.sub }}>{t("pages.fleet.fields.route")}:</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Violations tab ─────────────────────────────────────────── */
function ViolationsTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = VIOLATIONS.filter(v =>
    !search || v.vehicle.includes(search) || v.driver.includes(search) || v.type.includes(search)
  );

  const unpaidTotal = VIOLATIONS.filter(v => v.status === "غير مدفوعة").reduce((s, v) => s + v.amount, 0);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: "8px 16px", background: "#F5E0E0", border: "1px solid #ECC8C8", borderRadius: 12, textAlign: "end" }}>
          <p style={{ fontSize: 10, color: "#8B2020" }}>{t("pages.fleet.totalUnpaidViolations")}</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: "#8B2020" }}>{t("pages.fleet.currencyAed", { amount: unpaidTotal.toLocaleString() })}</p>
        </div>
      </div>
      <SectionHeader title={t("pages.fleet.tabs.violations")} search={search} onSearch={setSearch} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((v, i) => {
          const sc = VIOLATION_STATUS_COLORS[v.status];
          return (
            <motion.div key={v.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              style={{ background: C.card, border: `1px solid ${v.status === "غير مدفوعة" ? "#ECC8C8" : C.border}`, borderRadius: 14, padding: "16px 20px", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>

              {/* Status + amount */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 120, alignItems: "flex-end" }}>
                <StatusPill label={t(VIOLATION_STATUS_KEYS[v.status])} colors={sc} />
                <p style={{ fontSize: 15, fontWeight: 700, color: v.status === "غير مدفوعة" ? "#8B2020" : C.text }}>{t("pages.fleet.currencyAed", { amount: v.amount.toLocaleString() })}</p>
              </div>

              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px 20px", textAlign: "end" }}>
                {[
                  { label: t("pages.fleet.fields.violationNumber"), value: v.number },
                  { label: t("pages.fleet.fields.vehicle"), value: v.vehicle },
                  { label: t("pages.fleet.fields.driver"), value: v.driver },
                  { label: t("pages.fleet.fields.date"), value: v.date },
                  { label: t("pages.fleet.fields.violationType"), value: v.type },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p style={{ fontSize: 10, color: C.sub, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Maintenance tab ────────────────────────────────────────── */
function MaintenanceTab() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const filtered = MAINTENANCE.filter(m =>
    !search || m.vehicle.includes(search) || m.plate.includes(search) || m.workshop.includes(search)
  );

  return (
    <div>
      <SectionHeader title={t("pages.fleet.tabs.maintenance")} search={search} onSearch={setSearch} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filtered.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            style={{ background: C.card, border: `1px solid ${m.urgent ? "#ECC8C8" : C.border}`, borderRadius: 16, padding: "18px 20px", boxShadow: C.shadow, textAlign: "end", position: "relative", transition: "box-shadow 0.2s" }}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowMd}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadow}
          >
            {m.urgent && (
              <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", background: "#F5E0E0", borderRadius: 999, border: "1px solid #ECC8C8" }}>
                <AlertCircle size={10} strokeWidth={2} style={{ color: "#8B2020" }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: "#8B2020" }}>{t("pages.fleet.urgent")}</span>
              </div>
            )}

            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>{m.vehicle}</p>
            <p style={{ fontSize: 11, color: C.sub, marginBottom: 12 }}>{m.plate}</p>

            <div style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 8, background: m.urgent ? "#F5E0E0" : `${C.mangrove}12`, marginBottom: 14 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: m.urgent ? "#8B2020" : C.mangrove }}>{m.type}</span>
            </div>

            <div style={{ height: 1, background: C.border, marginBottom: 14 }} />

            {[
              { label: t("pages.fleet.fields.lastService"), value: m.lastDate },
              { label: t("pages.fleet.fields.nextService"), value: m.nextDate, highlight: m.urgent },
              { label: t("pages.fleet.fields.workshop"), value: m.workshop },
              { label: t("pages.fleet.fields.estimatedCost"), value: t("pages.fleet.currencyAed", { amount: m.cost.toLocaleString() }) },
            ].map(({ label, value, highlight }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: highlight ? 700 : 400, color: highlight ? "#8B2020" : C.text }}>{value}</span>
                <span style={{ fontSize: 10, color: C.sub }}>{label}</span>
              </div>
            ))}

            {m.notes && (
              <div style={{ marginTop: 10, padding: "8px 12px", background: "#F3E7D7", borderRadius: 8, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: 10, color: C.gold, fontWeight: 700, marginBottom: 3 }}>{t("pages.fleet.notes")}</p>
                <p style={{ fontSize: 11, color: C.text, lineHeight: 1.5 }}>{m.notes}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
type Tab = "vehicles" | "drivers" | "assignments" | "violations" | "maintenance" | "inspection";

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType; count?: number }> = [
  { id: "vehicles",     label: "المركبات",              icon: Car,           count: VEHICLES.length },
  { id: "drivers",      label: "السائقون",               icon: Users,         count: DRIVERS.length },
  { id: "assignments",  label: "الحركات والتكليفات",    icon: Route,         count: ASSIGNMENTS.length },
  { id: "violations",   label: "المخالفات",              icon: AlertTriangle, count: VIOLATIONS.length },
  { id: "maintenance",  label: "الصيانة",                icon: Wrench,        count: MAINTENANCE.length },
  { id: "inspection",   label: "التسليم والاستلام",      icon: ClipboardList, count: INSPECTION_REPORTS.length },
];

export default function FleetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("vehicles");
  const { t } = useTranslation();

  const alerts = [
    { text: t("pages.fleet.alerts.licenseExpiring"), level: "warn" },
    { text: t("pages.fleet.alerts.insuranceExpiring"), level: "warn" },
    { text: t("pages.fleet.alerts.unpaidViolations"), level: "error" },
  ];

  useRegisterPageContext({
    page: "fleet",
    titleAr: "إدارة الأسطول",
    titleEn: "Fleet Management",
    data: {
      totalVehicles: VEHICLES.length,
      availableVehicles: VEHICLES.filter((v) => v.status === "متاحة").length,
      inMaintenance: VEHICLES.filter((v) => v.status === "قيد الصيانة").length,
      totalDrivers: DRIVERS.length,
      onDuty: DRIVERS.filter((d) => d.status === "في مهمة").length,
      activeAssignments: ASSIGNMENTS.filter((a) => a.status === "جارية").length,
      upcomingAssignments: ASSIGNMENTS.filter((a) => a.status === "قادمة").length,
      unpaidViolations: VIOLATIONS.filter((v) => v.status === "غير مدفوعة").length,
      urgentMaintenance: MAINTENANCE.filter((m) => m.urgent).length,
    },
    suggestions: [
      { labelAr: t("ai.copilot.fleet.s1", { lng: "ar" }), labelEn: t("ai.copilot.fleet.s1", { lng: "en" }), prompt: t("ai.copilot.fleet.s1") },
      { labelAr: t("ai.copilot.fleet.s2", { lng: "ar" }), labelEn: t("ai.copilot.fleet.s2", { lng: "en" }), prompt: t("ai.copilot.fleet.s2") },
      { labelAr: t("ai.copilot.fleet.s3", { lng: "ar" }), labelEn: t("ai.copilot.fleet.s3", { lng: "en" }), prompt: t("ai.copilot.fleet.s3") },
      { labelAr: t("ai.copilot.fleet.s4", { lng: "ar" }), labelEn: t("ai.copilot.fleet.s4", { lng: "en" }), prompt: t("ai.copilot.fleet.s4") },
    ],
  });

  return (
    <Layout>
      {/* ── Header ─────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {/* Title — first in DOM = RIGHT in RTL */}
          <div style={{ textAlign: "end" }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "Georgia, serif", marginBottom: 4 }}>
              {t("pages.fleet.title")}
            </h1>
            <p style={{ fontSize: 12, color: C.sub }}>
              {t("pages.fleet.subtitle")}
            </p>
          </div>

          {/* Action buttons — last in DOM = LEFT in RTL */}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.sub, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              <Download size={13} strokeWidth={1.5} />
              {t("pages.fleet.exportReport")}
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.sub, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => window.print()}>
              <Printer size={13} strokeWidth={1.5} />
              {t("pages.fleet.print")}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Alerts bar ─────────────────────────────── */}
      <AnimatePresence>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {alerts.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 10, padding: "10px 16px", background: a.level === "error" ? "#FDF0F0" : "#FDF6E3", border: `1px solid ${a.level === "error" ? "#ECC8C8" : "#E8D8A0"}`, borderRadius: 12 }}>
              <AlertCircle size={14} strokeWidth={1.5} style={{ color: a.level === "error" ? "#CC3333" : "#B8960C", flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: a.level === "error" ? "#8B2020" : "#7A6010", fontWeight: 600 }}>{a.text}</span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* ── AI Fleet Copilot ────────────────────────── */}
      <div className="mb-6">
        <ContextualCopilot
          titleKey="ai.copilot.fleet.title"
          subtitleKey="ai.copilot.fleet.subtitle"
        />
      </div>

      {/* ── KPI cards ───────────────────────────────── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KpiCard label={t("pages.fleet.kpis.totalVehicles")}      value={24} sub={t("pages.fleet.kpis.totalVehiclesSub")}     icon={Car}           accent={C.gold} />
        <KpiCard label={t("pages.fleet.kpis.availableVehicles")}     value={18} sub={t("pages.fleet.kpis.availableVehiclesSub")}    icon={CheckCircle}   accent={C.mangrove} />
        <KpiCard label={t("pages.fleet.kpis.inMaintenance")}          value={3}  sub={t("pages.fleet.kpis.inMaintenanceSub")}  icon={Wrench}        accent="#C9931C" />
        <KpiCard label={t("pages.fleet.kpis.availableDrivers")}    value={19} sub={t("pages.fleet.kpis.availableDriversSub")}   icon={Users}         accent={C.teal} />
        <KpiCard label={t("pages.fleet.kpis.openViolations")}   value={5}  sub={t("pages.fleet.kpis.openViolationsSub")}   icon={AlertTriangle} accent="#CC3333" />
        <KpiCard label={t("pages.fleet.kpis.todayAssignments")}        value={7}  sub={t("pages.fleet.kpis.todayAssignmentsSub")}      icon={Route}         accent={C.gold} />
      </div>

      {/* ── Tab navigation ──────────────────────────── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 6, justifyContent: "flex-start", overflowX: "auto" }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, border: "none", background: active ? C.gold : "transparent", color: active ? "white" : C.sub, fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", flexShrink: 0 }}>
              <Icon size={13} strokeWidth={1.5} />
              {t(`pages.fleet.tabs.${tab.id}`)}
              {tab.count !== undefined && (
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 999, background: active ? "rgba(255,255,255,0.25)" : C.border, color: active ? "white" : C.sub }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ─────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "vehicles"    && <VehiclesTab />}
          {activeTab === "drivers"     && <DriversTab />}
          {activeTab === "assignments" && <AssignmentsTab />}
          {activeTab === "violations"  && <ViolationsTab />}
          {activeTab === "maintenance" && <MaintenanceTab />}
          {activeTab === "inspection"  && <InspectionTab />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

