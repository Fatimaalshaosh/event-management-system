import { palette } from "@/theme";







/* Extracted from family-tree.tsx — tokens, types, ruling-family dataset. */
export const C = { ...palette, border: "#E8DED1", shadow: "0 2px 16px rgba(61,53,41,0.10), 0 1px 4px rgba(61,53,41,0.06)" };

/* ─── Types ──────────────────────────────────────────────────── */
export type CardType = "leadership" | "family" | "spouse";
export type ViewMode = "sons-tree" | "maternal-branches";

export type SpouseInfo = {
  id: string;
  nameAr: string;
  title: string;
  initials: string;
  notes?: string;
  isVip?: boolean;
  isDeceased?: boolean;
};

export type ZayedWife = SpouseInfo & { sonIds: string[] };

export type TreeNode = {
  id: string;
  nameAr: string;
  title: string;
  role: string;
  generation: 0 | 1 | 2;
  isVip: boolean;
  isDeceased?: boolean;
  initials: string;
  cardType: CardType;
  notes?: string;
  motherBranch?: string;
  spouse?: SpouseInfo;
  children?: TreeNode[];
};

export type Selected =
  | { kind: "node"; node: TreeNode }
  | { kind: "zayed-wife"; wife: ZayedWife }
  | { kind: "son-wife"; spouse: SpouseInfo; sonName: string };

/* ─── Data: Zayed's wives ────────────────────────────────────── */
export const ZAYED_WIVES: ZayedWife[] = [
  {
    id: "w-fatima",
    nameAr: "صاحبة السمو الشيخة فاطمة بنت مبارك الكتبي",
    title: "أم الإمارات — رئيسة هيئة تنمية الأسرة",
    initials: "فم",
    isVip: true,
    notes: "شخصية قيادية وطنية بارزة. ناشطة اجتماعية وإنسانية. يُراعى حضورها في أرفع مراسم استقبالات الدولة.",
    sonIds: ["mhz", "mansour", "abdullah"],
  },
  {
    id: "w-hassa",
    nameAr: "سموّها الشيخة حصة بنت محمد آل نهيان",
    title: "زوجة المؤسس — رحمه الله",
    initials: "حن",
    notes: "والدة سمو الشيخ خليفة والشيوخ حمدان وهزاع وطحنون. تحظى باحترام رسمي رفيع.",
    sonIds: ["khalifa", "hamdan", "hazza", "tahnoun"],
  },
  {
    id: "w-mariam",
    nameAr: "سموّها الشيخة مريم بنت علي آل نهيان",
    title: "زوجة المؤسس — رحمه الله",
    initials: "من",
    notes: "يُرجى مراجعة الديوان الأميري للحصول على التفاصيل البروتوكولية الكاملة.",
    sonIds: ["sultan"],
  },
  {
    id: "w-hind",
    nameAr: "سموّها الشيخة هند بنت مطوع آل عفيف",
    title: "زوجة المؤسس — رحمه الله",
    initials: "هع",
    notes: "يُرجى مراجعة الديوان الأميري للحصول على التفاصيل البروتوكولية الكاملة.",
    sonIds: [],
  },
];

/* ─── Data: family tree ──────────────────────────────────────── */
export const ZAYED_TREE: TreeNode = {
  id: "zayed",
  nameAr: "الشيخ زايد بن سلطان آل نهيان",
  title: "مؤسس دولة الإمارات العربية المتحدة",
  role: "المؤسس — رحمه الله",
  generation: 0,
  isVip: true,
  isDeceased: true,
  initials: "ز",
  cardType: "leadership",
  notes:
    "المؤسس الأول لدولة الإمارات العربية المتحدة. يُعدّ المرجع الأعلى لجميع بروتوكولات التشريفات الرسمية. رحل في نوفمبر ٢٠٠٤.",
  children: [
    {
      id: "khalifa",
      nameAr: "صاحب السمو الشيخ خليفة بن زايد آل نهيان",
      title: "رئيس دولة الإمارات السابق — رحمه الله",
      role: "رئيس الدولة ٢٠٠٤–٢٠٢٢",
      generation: 1,
      isVip: true,
      isDeceased: true,
      initials: "خز",
      cardType: "leadership",
      motherBranch: "w-hassa",
      notes: "تولّى رئاسة الدولة من ٢٠٠٤ حتى وفاته في مايو ٢٠٢٢. مرجع بروتوكولي راسخ.",
      children: [],
    },
    {
      id: "mhz",
      nameAr: "صاحب السمو الشيخ محمد بن زايد آل نهيان",
      title: "رئيس دولة الإمارات العربية المتحدة",
      role: "رئيس الدولة منذ ٢٠٢٢",
      generation: 1,
      isVip: true,
      isDeceased: false,
      initials: "مز",
      cardType: "leadership",
      motherBranch: "w-fatima",
      spouse: {
        id: "sp-salama",
        nameAr: "سموّها الشيخة سلامة بنت بطي آل حمدان",
        title: "حرم رئيس الدولة",
        initials: "سح",
        isVip: true,
        notes: "تُراعى البروتوكولات الرسمية الكاملة في حضورها في كافة الفعاليات الدولة.",
      },
      notes: "رئيس الدولة الحالي منذ مايو ٢٠٢٢. يتلقّى أعلى درجات البروتوكول في استقبال رؤساء الدول.",
      children: [
        { id: "khaled-mhz", nameAr: "سمو الشيخ خالد بن محمد بن زايد", title: "رئيس ديوان الرئاسة — وزير الدولة", role: "ابن رئيس الدولة", generation: 2, isVip: true, initials: "خم", cardType: "family", children: [] },
        { id: "dhiab-mhz", nameAr: "سمو الشيخ ذياب بن محمد بن زايد", title: "مستشار الشؤون الاستراتيجية", role: "ابن رئيس الدولة", generation: 2, isVip: false, initials: "ذم", cardType: "family", children: [] },
        { id: "zayed-mhz", nameAr: "سمو الشيخ زايد بن محمد بن زايد", title: "نجل رئيس الدولة — مُسمّى على المؤسس", role: "ابن رئيس الدولة", generation: 2, isVip: false, initials: "زم", cardType: "family", children: [] },
        { id: "shakb-mhz", nameAr: "سمو الشيخ شخبوط بن محمد بن زايد", title: "سفير — وزير الدولة السابق", role: "ابن رئيس الدولة", generation: 2, isVip: false, initials: "شم", cardType: "family", children: [] },
      ],
    },
    {
      id: "sultan",
      nameAr: "سمو الشيخ سلطان بن زايد آل نهيان",
      title: "ممثل رئيس الدولة",
      role: "ابن المؤسس",
      generation: 1,
      isVip: true,
      initials: "سز",
      cardType: "family",
      motherBranch: "w-mariam",
      notes: "يمثّل رئيس الدولة في المهام الرسمية الداخلية والخارجية.",
      children: [],
    },
    {
      id: "hamdan",
      nameAr: "سمو الشيخ حمدان بن زايد آل نهيان",
      title: "ممثل الحاكم في منطقة الظفرة",
      role: "ابن المؤسس",
      generation: 1,
      isVip: true,
      initials: "حز",
      cardType: "family",
      motherBranch: "w-hassa",
      notes: "يتولى ممثلية الحاكم في منطقة الظفرة. يشارك في بروتوكولات الاستقبال الإقليمية.",
      children: [
        { id: "zayed-hamdan", nameAr: "سمو الشيخ زايد بن حمدان بن زايد", title: "مسؤول بروتوكول — الظفرة", role: "ابن حمدان", generation: 2, isVip: false, initials: "زح", cardType: "family", children: [] },
      ],
    },
    {
      id: "hazza",
      nameAr: "سمو الشيخ هزاع بن زايد آل نهيان",
      title: "نائب رئيس الديوان الأميري",
      role: "ابن المؤسس",
      generation: 1,
      isVip: true,
      initials: "هز",
      cardType: "family",
      motherBranch: "w-hassa",
      notes: "يُشرف على الديوان الأميري وشؤون التشريفات. اتصاله المباشر مع فريق البروتوكول.",
      children: [],
    },
    {
      id: "tahnoun",
      nameAr: "سمو الشيخ طحنون بن زايد آل نهيان",
      title: "مستشار الأمن الوطني",
      role: "ابن المؤسس",
      generation: 1,
      isVip: true,
      initials: "طز",
      cardType: "family",
      motherBranch: "w-hassa",
      notes: "مستشار الأمن الوطني ورئيس المجلس الأعلى للأمن الوطني.",
      children: [],
    },
    {
      id: "mansour",
      nameAr: "سمو الشيخ منصور بن زايد آل نهيان",
      title: "نائب رئيس مجلس الوزراء — وزير ديوان الرئاسة",
      role: "ابن المؤسس",
      generation: 1,
      isVip: true,
      initials: "مص",
      cardType: "leadership",
      motherBranch: "w-fatima",
      spouse: {
        id: "sp-mane",
        nameAr: "سموّها الشيخة مانع بنت محمد بن راشد آل مكتوم",
        title: "حرم سمو الشيخ منصور — نجلة حاكم دبي السابق",
        initials: "مد",
        isVip: true,
        notes: "ارتباط مشيخي رفيع يعزّز العلاقة بين أبوظبي ودبي بروتوكولياً.",
      },
      notes: "يتولى حقيبتَي الديوان الرئاسي ونيابة رئيس الوزراء. اتصاله المباشر مع فريق التشريفات.",
      children: [
        { id: "zayed-mansour", nameAr: "سمو الشيخ زايد بن منصور بن زايد", title: "نجل سمو الشيخ منصور", role: "ابن منصور", generation: 2, isVip: false, initials: "زص", cardType: "family", children: [] },
      ],
    },
    {
      id: "abdullah",
      nameAr: "سمو الشيخ عبدالله بن زايد آل نهيان",
      title: "وزير الخارجية والتعاون الدولي",
      role: "ابن المؤسس",
      generation: 1,
      isVip: true,
      initials: "عز",
      cardType: "family",
      motherBranch: "w-fatima",
      notes: "وزير الخارجية والواجهة الدبلوماسية للدولة. حضوره إلزامي في استقبالات الوفود الدبلوماسية.",
      children: [
        { id: "zayed-abdullah", nameAr: "سمو الشيخ زايد بن عبدالله بن زايد", title: "نجل وزير الخارجية", role: "ابن عبدالله", generation: 2, isVip: false, initials: "زع", cardType: "family", children: [] },
      ],
    },
  ],
};

export const SONS = ZAYED_TREE.children ?? [];

