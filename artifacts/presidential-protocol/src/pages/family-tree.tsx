
import { useState, useRef, useCallback } from "react";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import { useRegisterPageContext } from "@/ai/page-context";
import { useTranslation } from "react-i18next";
import { Search, ZoomIn, ZoomOut, Printer, X, RefreshCw, Users, GitBranch } from "lucide-react";
import { C, ViewMode, ZayedWife, TreeNode, Selected, ZAYED_WIVES, ZAYED_TREE, SONS } from "@/components/family-tree/data";
import { PersonCard, ConnSeg, ZayedWivesSection, GrandchildrenPanel, MaternalBranchesView, DetailPanel } from "@/components/family-tree/components";

/* ─── Main page ──────────────────────────────────────────────── */
export default function FamilyTreePage() {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(0.88);
  const [search, setSearch] = useState("");

  useRegisterPageContext({
    page: "family-tree",
    titleAr: "شجرة العائلة الحاكمة",
    titleEn: "Ruling Family Lineage",
    data: { currentSearch: search || null },
    // intentionally minimal — no large suggestions list per spec
  });
  const [selected, setSelected] = useState<Selected | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [wivesOpen, setWivesOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("sons-tree");

  const treeRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, sl: 0, st: 0 });

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleSelectNode = useCallback((n: TreeNode) => {
    setSelected((prev) =>
      prev?.kind === "node" && prev.node.id === n.id ? null : { kind: "node", node: n }
    );
  }, []);

  const handleSelectZayedWife = useCallback((w: ZayedWife) => {
    setSelected((prev) =>
      prev?.kind === "zayed-wife" && prev.wife.id === w.id ? null : { kind: "zayed-wife", wife: w }
    );
  }, []);

  const matchSearch = (n: TreeNode) =>
    search ? n.nameAr.includes(search) || n.title.includes(search) : false;

  const onMouseDown = (e: React.MouseEvent) => {
    if (!treeRef.current) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, sl: treeRef.current.scrollLeft, st: treeRef.current.scrollTop };
    treeRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !treeRef.current) return;
    treeRef.current.scrollLeft = dragStart.current.sl - (e.clientX - dragStart.current.x);
    treeRef.current.scrollTop = dragStart.current.st - (e.clientY - dragStart.current.y);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (treeRef.current) treeRef.current.style.cursor = "grab";
  };

  return (
    <Layout>
      {/* ── Page header ───────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* View mode toggle */}
            <div style={{ display: "flex", background: "#F0E8DE", borderRadius: 12, padding: 4, gap: 2 }}>
              {([
                { id: "sons-tree" as ViewMode, label: "شجرة الأبناء", icon: GitBranch },
                { id: "maternal-branches" as ViewMode, label: "الفروع الأمومية", icon: Users },
              ]).map(({ id, label, icon: Icon }) => {
                const active = viewMode === id;
                return (
                  <button key={id} onClick={() => setViewMode(id)}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 9, border: "none", background: active ? C.gold : "transparent", color: active ? "white" : C.sub, fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                    <Icon size={11} strokeWidth={1.5} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Zoom */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "4px 6px" }}>
              <button onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, display: "flex", padding: 3 }}>
                <ZoomOut size={14} strokeWidth={1.5} />
              </button>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.text, minWidth: 36, textAlign: "center" }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, display: "flex", padding: 3 }}>
                <ZoomIn size={14} strokeWidth={1.5} />
              </button>
            </div>

            <button onClick={() => setZoom(0.88)} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 8px", cursor: "pointer", color: C.sub, display: "flex" }}>
              <RefreshCw size={14} strokeWidth={1.5} />
            </button>
            <button onClick={() => window.print()} style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 10, padding: "6px 10px", cursor: "pointer", color: C.sub, display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontFamily: "inherit" }}>
              <Printer size={13} strokeWidth={1.5} />
              طباعة
            </button>
          </div>

          {/* Title */}
          <div style={{ textAlign: "end" }}>
            <h1 style={{ fontSize: 21, fontWeight: 700, color: C.text, fontFamily: "Georgia, serif", marginBottom: 4 }}>
              {t("pages.familyTree.title")}
            </h1>
            <p style={{ fontSize: 12, color: C.sub }}>
              {t("pages.familyTree.subtitle")}
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginTop: 14, maxWidth: 340, marginInlineStart: "auto" }}>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو اللقب الرسمي..."
            style={{ width: "100%", padding: "9px 36px 9px 30px", borderRadius: 12, border: `1.5px solid ${search ? C.gold : C.border}`, background: "white", color: C.text, fontSize: 12, outline: "none", textAlign: "end", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e) => (e.target.style.borderColor = search ? C.gold : C.border)}
          />
          <Search size={14} strokeWidth={1.5} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 12, color: C.sub, pointerEvents: "none" }} />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", left: 8, background: "none", border: "none", cursor: "pointer", color: C.sub, display: "flex" }}>
              <X size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Body ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", minHeight: 520 }}>
        {/* Tree canvas */}
        <div
          ref={treeRef}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{ flex: 1, background: "white", border: `1px solid ${C.border}`, borderRadius: 20, boxShadow: "0 3px 16px rgba(61,53,41,0.08)", overflow: "auto", cursor: "grab", minHeight: 520, position: "relative" }}
        >
          {/* Geometric watermark */}
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.022, pointerEvents: "none" }}>
            <defs>
              <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="#AD8965" strokeWidth="0.8" />
                <circle cx="40" cy="40" r="8" fill="none" stroke="#AD8965" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo)" />
          </svg>

          {/* Scaled content */}
          <div style={{ transformOrigin: "top center", transform: `scale(${zoom})`, transition: "transform 0.2s ease", padding: "36px 60px 52px", display: "flex", flexDirection: "column", alignItems: "center", minWidth: "max-content" }}>

            {viewMode === "sons-tree" && (
              <>
                {/* Gen label */}
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.sub, opacity: 0.55, marginBottom: 10, textTransform: "uppercase" }}>الجيل التأسيسي</p>

                {/* Founder card */}
                <PersonCard
                  node={ZAYED_TREE}
                  isSelected={selected?.kind === "node" && selected.node.id === ZAYED_TREE.id}
                  isHighlighted={matchSearch(ZAYED_TREE)}
                  onSelect={handleSelectNode}
                />

                {/* Zayed wives collapsible */}
                <ZayedWivesSection
                  wives={ZAYED_WIVES}
                  isOpen={wivesOpen}
                  onToggle={() => setWivesOpen(!wivesOpen)}
                  selected={selected}
                  onSelect={handleSelectZayedWife}
                />

                {/* Gen label */}
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.sub, opacity: 0.55, marginBottom: 4, textTransform: "uppercase" }}>الجيل الأول — الأبناء</p>

                {/* Sons connector */}
                <div style={{ display: "flex", width: "100%" }}>
                  {SONS.map((_, i) => (
                    <ConnSeg key={i} index={i} total={SONS.length} height={40} />
                  ))}
                </div>

                {/* Sons row */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 0, width: "100%" }}>
                  {SONS.map((son) => {
                    const isExp = expandedIds.has(son.id);
                    const kids = son.children ?? [];
                    return (
                      <div key={son.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 6px" }}>
                        <PersonCard
                          node={son}
                          isSelected={selected?.kind === "node" && selected.node.id === son.id}
                          isHighlighted={matchSearch(son)}
                          onSelect={handleSelectNode}
                          onToggle={kids.length > 0 ? () => toggleExpand(son.id) : undefined}
                          isExpanded={isExp}
                        />
                        <AnimatePresence>
                          {isExp && kids.length > 0 && (
                            <GrandchildrenPanel
                              children={kids}
                              selected={selected}
                              onSelect={handleSelectNode}
                              searchTerm={search}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {viewMode === "maternal-branches" && (
              <>
                <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.sub, opacity: 0.55, marginBottom: 20, textTransform: "uppercase" }}>الفروع الأمومية — زوجات المؤسس وأبناؤهن</p>
                <MaternalBranchesView
                  wives={ZAYED_WIVES}
                  sons={SONS}
                  selected={selected}
                  onSelectWife={handleSelectZayedWife}
                  onSelectSon={handleSelectNode}
                  searchTerm={search}
                />
              </>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <DetailPanel
              selected={selected}
              wives={ZAYED_WIVES}
              onClose={() => setSelected(null)}
              onSelectNode={(n) => setSelected({ kind: "node", node: n })}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Legend ──────────────────────────────────── */}
      <div style={{ marginTop: 20, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { color: C.gold, label: "بطاقة قيادية", style: "2px solid" },
          { color: C.border, label: "بطاقة عائلية", style: "1px solid" },
          { color: C.teal, label: "بطاقة الزوجة", style: "1px solid" },
        ].map(({ color, label, style }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 10.5, color: C.sub }}>{label}</span>
            <div style={{ width: 20, height: 12, borderRadius: 4, border: `${style} ${color}`, background: color === C.teal ? `${C.teal}12` : "transparent" }} />
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 10.5, color: C.sub }}>لديه زوجة موثقة</span>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal }} />
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────── */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <p style={{ fontSize: 10, color: C.sub, opacity: 0.65, padding: "7px 18px", background: "white", border: `1px solid ${C.border}`, borderRadius: 999 }}>
          هذه البيانات نموذجية وقابلة للتحديث من قبل فريق البروتوكول
        </p>
      </div>
    </Layout>
  );
}

