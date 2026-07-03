


import { motion, AnimatePresence } from "framer-motion";


import { Star, Info, X, ChevronDown, ChevronUp, Users } from "lucide-react";
import { C, CardType, SpouseInfo, ZayedWife, TreeNode, Selected, SONS } from "@/components/family-tree/data";

/* Extracted from family-tree.tsx — cards, connectors, panels, views. */
/* ─── Avatar ─────────────────────────────────────────────────── */
export function Avatar({
  initials,
  cardType,
  isDeceased,
  size = 44,
}: {
  initials: string;
  cardType: CardType;
  isDeceased?: boolean;
  size?: number;
}) {
  const bg =
    cardType === "leadership" && !isDeceased
      ? `linear-gradient(145deg, #C09A72, #D4B48A)`
      : cardType === "spouse"
      ? `linear-gradient(145deg, ${C.teal}90, ${C.teal})`
      : isDeceased
      ? `linear-gradient(145deg, #C5B4A0, #D8CCBE)`
      : `linear-gradient(145deg, #BFAE9E, #D0C2B2)`;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow:
          cardType === "leadership" && !isDeceased
            ? "0 3px 12px rgba(173,137,101,0.35)"
            : cardType === "spouse"
            ? `0 2px 8px rgba(151,178,177,0.35)`
            : "0 1px 6px rgba(61,53,41,0.12)",
        border: `1.5px solid rgba(255,255,255,0.5)`,
      }}
    >
      <span
        style={{
          fontSize: size * 0.3,
          fontWeight: 700,
          color:
            cardType === "spouse"
              ? "white"
              : isDeceased
              ? C.sub
              : cardType === "leadership"
              ? "white"
              : C.text,
          fontFamily: "Georgia, serif",
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}

/* ─── Person card ────────────────────────────────────────────── */
export function PersonCard({
  node,
  isSelected,
  isHighlighted,
  onSelect,
  onToggle,
  isExpanded,
}: {
  node: TreeNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: (n: TreeNode) => void;
  onToggle?: () => void;
  isExpanded?: boolean;
}) {
  const isLeadership = node.cardType === "leadership";
  const isFounder = node.generation === 0;
  const hasKids = (node.children ?? []).length > 0;

  const borderColor = isSelected
    ? C.mangrove
    : isLeadership
    ? C.gold
    : isHighlighted
    ? C.teal
    : C.border;

  const cardBg = isSelected
    ? `linear-gradient(145deg, ${C.mangrove}10, ${C.teal}08)`
    : isLeadership
    ? `linear-gradient(145deg, #FFFDF9, #FBF5EA)`
    : C.card;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
      onClick={() => onSelect(node)}
      style={{
        background: cardBg,
        border: `${isLeadership || isSelected ? 2 : 1}px solid ${borderColor}`,
        borderRadius: isFounder ? 20 : isLeadership ? 18 : 14,
        padding: isFounder ? "22px 20px 18px" : isLeadership ? "16px 16px 14px" : "13px 14px 11px",
        boxShadow: isSelected
          ? `0 6px 24px rgba(103,131,92,0.22)`
          : isLeadership
          ? C.shadowGold
          : C.shadow,
        cursor: "pointer",
        width: isFounder ? 240 : isLeadership ? 162 : 152,
        position: "relative",
        textAlign: "center",
        userSelect: "none",
        flexShrink: 0,
        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = C.shadowHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = isSelected
          ? `0 6px 24px rgba(103,131,92,0.22)`
          : isLeadership
          ? C.shadowGold
          : C.shadow;
      }}
    >
      {node.isDeceased && (
        <div style={{ position: "absolute", top: 8, left: 8, fontSize: 8, color: C.sub, background: `${C.border}90`, padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>
          رحمه الله
        </div>
      )}
      {node.isVip && (
        <div style={{ position: "absolute", top: 9, right: 9 }}>
          <Star size={10} strokeWidth={1} fill={C.gold} style={{ color: C.gold }} />
        </div>
      )}
      {/* Spouse indicator dot */}
      {node.spouse && !isFounder && (
        <div style={{ position: "absolute", top: 9, left: node.isDeceased ? 60 : 9, width: 7, height: 7, borderRadius: "50%", background: C.teal, border: `1.5px solid white` }} />
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <Avatar initials={node.initials} cardType={node.cardType} isDeceased={node.isDeceased} size={isFounder ? 52 : isLeadership ? 42 : 36} />
      </div>

      <p style={{ fontSize: isFounder ? 13 : isLeadership ? 11 : 10.5, fontWeight: 700, color: C.text, lineHeight: 1.45, marginBottom: 4 }}>
        {node.nameAr}
      </p>
      <p style={{ fontSize: isFounder ? 10 : 9, color: C.sub, lineHeight: 1.4, marginBottom: 8 }}>
        {node.title}
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{
          fontSize: 8,
          fontWeight: 700,
          padding: "2px 9px",
          borderRadius: 999,
          background: isSelected ? `${C.mangrove}15` : isLeadership ? `${C.gold}18` : C.border,
          color: isSelected ? C.mangrove : isLeadership ? C.gold : C.sub,
          border: isLeadership && !isSelected ? `1px solid ${C.goldLight}` : "none",
        }}>
          {node.role}
        </span>
      </div>

      {hasKids && onToggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{
            position: "absolute", bottom: 8, right: 8,
            background: isExpanded ? `${C.mangrove}18` : "none",
            border: `1px solid ${isExpanded ? C.mangrove : C.border}`,
            borderRadius: 6, cursor: "pointer",
            padding: "2px 5px", display: "flex", alignItems: "center", gap: 3,
            color: isExpanded ? C.mangrove : C.sub, transition: "all 0.15s",
          }}
        >
          {isExpanded ? <ChevronUp size={9} strokeWidth={2} /> : <ChevronDown size={9} strokeWidth={2} />}
          <span style={{ fontSize: 8, fontWeight: 600 }}>{(node.children ?? []).length}</span>
        </button>
      )}
      {node.notes && (
        <div style={{ position: "absolute", bottom: 8, left: 8 }}>
          <Info size={9} strokeWidth={1.5} style={{ color: C.sub, opacity: 0.5 }} />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Spouse card (smaller, softer) ─────────────────────────── */
export function SpouseCard({
  spouse,
  isSelected,
  onSelect,
  size = "normal",
}: {
  spouse: SpouseInfo | ZayedWife;
  isSelected: boolean;
  onSelect: () => void;
  size?: "small" | "normal" | "large";
}) {
  const w = size === "large" ? 190 : size === "small" ? 130 : 155;
  const pad = size === "large" ? "16px 18px 14px" : size === "small" ? "10px 12px" : "13px 14px 11px";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onSelect}
      style={{
        background: isSelected ? `linear-gradient(145deg, ${C.teal}12, ${C.teal}06)` : C.cardSpouse,
        border: `${isSelected ? 2 : 1}px solid ${isSelected ? C.teal : `${C.teal}55`}`,
        borderRadius: 14,
        padding: pad,
        boxShadow: isSelected
          ? `0 4px 16px rgba(151,178,177,0.28)`
          : `0 1px 8px rgba(61,53,41,0.07)`,
        cursor: "pointer",
        width: w,
        textAlign: "center",
        flexShrink: 0,
        userSelect: "none",
        transition: "all 0.18s",
        position: "relative",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 14px rgba(151,178,177,0.25)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.boxShadow = isSelected ? `0 4px 16px rgba(151,178,177,0.28)` : `0 1px 8px rgba(61,53,41,0.07)`)}
    >
      {spouse.isVip && (
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <Star size={9} strokeWidth={1} fill={C.teal} style={{ color: C.teal }} />
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "center", marginBottom: size === "small" ? 7 : 10 }}>
        <Avatar initials={spouse.initials} cardType="spouse" isDeceased={spouse.isDeceased} size={size === "large" ? 44 : size === "small" ? 30 : 36} />
      </div>

      <p style={{ fontSize: size === "large" ? 11.5 : size === "small" ? 9.5 : 10.5, fontWeight: 700, color: C.text, lineHeight: 1.45, marginBottom: 4 }}>
        {spouse.nameAr}
      </p>
      <p style={{ fontSize: size === "small" ? 8.5 : 9.5, color: C.sub, lineHeight: 1.4 }}>
        {spouse.title}
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${C.teal}18`, color: C.teal }}>
          زوجة
        </span>
      </div>
    </motion.div>
  );
}

/* ─── Connector segment ──────────────────────────────────────── */
export function ConnSeg({ index, total, height = 40 }: { index: number; total: number; height?: number }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const isOnly = total === 1;
  return (
    <div style={{ flex: 1, height, position: "relative", display: "flex", justifyContent: "center" }}>
      {!isFirst && !isOnly && <div style={{ position: "absolute", left: 0, right: "50%", top: "50%", height: 1, background: C.connector }} />}
      {!isLast && !isOnly && <div style={{ position: "absolute", left: "50%", right: 0, top: "50%", height: 1, background: C.connector }} />}
      <div style={{ width: 1, height: "100%", background: C.connector }} />
    </div>
  );
}

export function VLine({ height = 28 }: { height?: number }) {
  return <div style={{ width: 1, height, background: `linear-gradient(to bottom, ${C.border}, ${C.gold}44)`, margin: "0 auto", flexShrink: 0 }} />;
}

/* ─── Zayed wives collapsible section ────────────────────────── */
export function ZayedWivesSection({
  wives,
  isOpen,
  onToggle,
  selected,
  onSelect,
}: {
  wives: ZayedWife[];
  isOpen: boolean;
  onToggle: () => void;
  selected: Selected | null;
  onSelect: (w: ZayedWife) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
      <VLine height={20} />
      <button
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "6px 18px",
          borderRadius: 999,
          border: `1px solid ${isOpen ? C.teal : C.border}`,
          background: isOpen ? `${C.teal}12` : C.card,
          color: isOpen ? C.teal : C.sub,
          fontSize: 11, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.2s",
          boxShadow: "0 1px 6px rgba(61,53,41,0.06)",
        }}
      >
        {isOpen ? <ChevronUp size={12} strokeWidth={2} /> : <ChevronDown size={12} strokeWidth={2} />}
        زوجات المؤسس ({wives.length})
        <Users size={12} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", width: "100%" }}
          >
            <div style={{ padding: "16px 0 4px", display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              {wives.map((w) => (
                <SpouseCard
                  key={w.id}
                  spouse={w}
                  isSelected={selected?.kind === "zayed-wife" && selected.wife.id === w.id}
                  onSelect={() => onSelect(w)}
                  size="normal"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <VLine height={20} />
    </div>
  );
}

/* ─── Grandchildren panel ────────────────────────────────────── */
export function GrandchildrenPanel({
  children,
  selected,
  onSelect,
  searchTerm,
}: {
  children: TreeNode[];
  selected: Selected | null;
  onSelect: (n: TreeNode) => void;
  searchTerm: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <div style={{ display: "flex", width: "100%" }}>
        {children.map((_, i) => (
          <ConnSeg key={i} index={i} total={children.length} height={36} />
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        {children.map((gc) => (
          <PersonCard
            key={gc.id}
            node={gc}
            isSelected={selected?.kind === "node" && selected.node.id === gc.id}
            isHighlighted={!!(searchTerm && gc.nameAr.includes(searchTerm))}
            onSelect={onSelect}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Maternal branches view ─────────────────────────────────── */
export function MaternalBranchesView({
  wives,
  sons,
  selected,
  onSelectWife,
  onSelectSon,
  searchTerm,
}: {
  wives: ZayedWife[];
  sons: TreeNode[];
  selected: Selected | null;
  onSelectWife: (w: ZayedWife) => void;
  onSelectSon: (n: TreeNode) => void;
  searchTerm: string;
}) {
  return (
    <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap", padding: "20px 0" }}>
      {wives.map((wife) => {
        const wifeSons = sons.filter((s) => s.motherBranch === wife.id);
        return (
          <div key={wife.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <SpouseCard
              spouse={wife}
              isSelected={selected?.kind === "zayed-wife" && selected.wife.id === wife.id}
              onSelect={() => onSelectWife(wife)}
              size="large"
            />

            {wifeSons.length > 0 ? (
              <>
                <VLine height={20} />
                <div style={{ display: "flex", width: "100%" }}>
                  {wifeSons.map((_, i) => (
                    <ConnSeg key={i} index={i} total={wifeSons.length} height={28} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {wifeSons.map((son) => (
                    <motion.div
                      key={son.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                    >
                      <PersonCard
                        node={son}
                        isSelected={selected?.kind === "node" && selected.node.id === son.id}
                        isHighlighted={!!(searchTerm && son.nameAr.includes(searchTerm))}
                        onSelect={onSelectSon}
                      />
                      {/* Small wife dot if son has spouse */}
                      {son.spouse && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.teal }} />
                          <span style={{ fontSize: 8, color: C.teal, fontWeight: 600 }}>متزوج</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <p style={{ fontSize: 10, color: C.sub, marginTop: 12, opacity: 0.6 }}>— غير محدد —</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Detail side panel ──────────────────────────────────────── */
export function DetailPanel({
  selected,
  wives,
  onClose,
  onSelectNode,
}: {
  selected: Selected;
  wives: ZayedWife[];
  onClose: () => void;
  onSelectNode: (n: TreeNode) => void;
}) {
  const isNode = selected.kind === "node";
  const isZayedWife = selected.kind === "zayed-wife";
  const isSonWife = selected.kind === "son-wife";

  const node = isNode ? selected.node : null;
  const wife = isZayedWife ? selected.wife : null;
  const sonWife = isSonWife ? selected.spouse : null;

  const motherWife = node?.motherBranch ? wives.find((w) => w.id === node.motherBranch) : null;
  const wifeSons = wife ? SONS.filter((s) => wife.sonIds.includes(s.id)) : [];

  const panelSubject = node || wife || sonWife!;
  const cardType: CardType =
    node?.cardType ?? (wife || sonWife ? "spouse" : "family");

  const protocolLevel =
    node?.generation === 0
      ? "أعلى — مرجع مؤسسي"
      : node?.cardType === "leadership"
      ? "رفيع جداً — بروتوكول كامل"
      : node?.isVip
      ? "رفيع — مراسم رسمية"
      : wife?.isVip
      ? "رفيعة — ضيوف الدولة"
      : "عائلي — مراسم مناسبة";

  return (
    <motion.div
      key={panelSubject.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.22 }}
      style={{
        width: 280,
        flexShrink: 0,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(61,53,41,0.13)",
        alignSelf: "flex-start",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: cardType === "spouse" ? `linear-gradient(to left, ${C.teal}18, transparent)` : `linear-gradient(to left, ${C.goldLight}20, transparent)` }}>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.sub, padding: 4, borderRadius: 8, display: "flex" }}>
          <X size={14} strokeWidth={1.5} />
        </button>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.text }}>بطاقة البروتوكول</p>
      </div>

      <div style={{ padding: 20, maxHeight: "80vh", overflowY: "auto" }}>
        {/* Avatar + name */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginBottom: 18 }}>
          <Avatar initials={panelSubject.initials} cardType={cardType} isDeceased={panelSubject.isDeceased} size={52} />
          <h3 style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginTop: 12, textAlign: "end", lineHeight: 1.45 }}>
            {panelSubject.nameAr}
          </h3>
          {panelSubject.isDeceased && (
            <span style={{ fontSize: 9, color: C.sub, background: `${C.border}80`, padding: "1px 8px", borderRadius: 4, marginTop: 4, fontWeight: 600 }}>
              رحمه الله
            </span>
          )}
          {(panelSubject as SpouseInfo).isVip && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: C.gold }}>شخصية رفيعة</span>
              <Star size={10} strokeWidth={1} fill={C.gold} style={{ color: C.gold }} />
            </div>
          )}
        </div>

        {/* Core info */}
        {[
          { label: "اللقب الرسمي", value: panelSubject.title },
          ...(node ? [
            { label: "الدور البروتوكولي", value: node.role },
            { label: "الجيل", value: node.generation === 0 ? "الجيل التأسيسي" : node.generation === 1 ? "الجيل الأول" : "الجيل الثاني" },
          ] : []),
          ...(wife ? [{ label: "الارتباط", value: `والدة ${wife.sonIds.length} من الأبناء` }] : []),
        ].map(({ label, value }) => (
          <div key={label} style={{ marginBottom: 12, textAlign: "end" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 11.5, color: C.text, lineHeight: 1.5 }}>{value}</p>
            <div style={{ height: 1, background: C.border, marginTop: 10 }} />
          </div>
        ))}

        {/* Protocol level */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: `${C.gold}10`, border: `1px solid ${C.goldLight}`, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>{protocolLevel}</span>
          <span style={{ fontSize: 10, color: C.sub }}>مستوى البروتوكول</span>
        </div>

        {/* Maternal branch (for sons) */}
        {motherWife && (
          <div style={{ marginBottom: 14, textAlign: "end" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 8 }}>الفرع الأمومي</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "10px 12px", borderRadius: 10, background: `${C.teal}10`, border: `1px solid ${C.teal}40` }}>
              <span style={{ fontSize: 11, color: C.text, lineHeight: 1.4 }}>{motherWife.nameAr}</span>
              <Avatar initials={motherWife.initials} cardType="spouse" size={28} />
            </div>
            <div style={{ height: 1, background: C.border, marginTop: 12 }} />
          </div>
        )}

        {/* Spouse (for sons who have one) */}
        {node?.spouse && (
          <div style={{ marginBottom: 14, textAlign: "end" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 8 }}>الزوجة الكريمة</p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, justifyContent: "flex-end", padding: "10px 12px", borderRadius: 10, background: `${C.teal}08`, border: `1px solid ${C.teal}35` }}>
              <div style={{ textAlign: "end" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{node.spouse.nameAr}</p>
                <p style={{ fontSize: 9.5, color: C.sub, marginTop: 3 }}>{node.spouse.title}</p>
                {node.spouse.isVip && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 5 }}>
                    <Star size={8} strokeWidth={1} fill={C.teal} style={{ color: C.teal }} />
                    <span style={{ fontSize: 8, color: C.teal, fontWeight: 700 }}>شخصية بروتوكول رفيعة</span>
                  </div>
                )}
              </div>
              <Avatar initials={node.spouse.initials} cardType="spouse" size={32} />
            </div>
            <div style={{ height: 1, background: C.border, marginTop: 12 }} />
          </div>
        )}

        {/* Children / sons list */}
        {node && (node.children ?? []).length > 0 && (
          <div style={{ marginBottom: 14, textAlign: "end" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 8 }}>الأبناء ({(node.children ?? []).length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(node.children ?? []).map((child) => (
                <button
                  key={child.id}
                  onClick={() => onSelectNode(child)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "7px 10px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, cursor: "pointer", textAlign: "end", fontFamily: "inherit", width: "100%", transition: "background 0.15s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = `${C.border}80`)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = C.bg)}
                >
                  <div>
                    <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text }}>{child.nameAr}</p>
                    <p style={{ fontSize: 9, color: C.sub }}>{child.role}</p>
                  </div>
                  <Avatar initials={child.initials} cardType={child.cardType} size={24} />
                </button>
              ))}
            </div>
            <div style={{ height: 1, background: C.border, marginTop: 12 }} />
          </div>
        )}

        {/* Wife's sons list */}
        {wife && wifeSons.length > 0 && (
          <div style={{ marginBottom: 14, textAlign: "end" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.sub, marginBottom: 8 }}>أبناؤها ({wifeSons.length})</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {wifeSons.map((son) => (
                <div key={son.id} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, padding: "7px 10px", borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}>
                  <div>
                    <p style={{ fontSize: 10.5, fontWeight: 600, color: C.text }}>{son.nameAr}</p>
                    <p style={{ fontSize: 9, color: C.sub }}>{son.title}</p>
                  </div>
                  <Avatar initials={son.initials} cardType={son.cardType} size={24} />
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: C.border, marginTop: 12 }} />
          </div>
        )}

        {/* Protocol notes */}
        {panelSubject.notes && (
          <div style={{ background: "#F3E7D7", border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "end" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5, marginBottom: 7 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: C.gold }}>ملاحظات البروتوكول</p>
              <Info size={10} strokeWidth={1.5} style={{ color: C.gold }} />
            </div>
            <p style={{ fontSize: 11, color: C.text, lineHeight: 1.65 }}>{panelSubject.notes}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
