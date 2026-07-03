import type { DiplomaticMemory, MissionContext } from "./types";

/** Demo diplomatic memory — fictional, linked to mission DNA by country. */
const MEMORY: Record<string, DiplomaticMemory> = {
  FR: {
    countryCode: "FR",
    previousVisits: [
      { en: "State visit 2021 — Abu Dhabi", ar: "زيارة دولة ٢٠٢١ — أبوظبي" },
      { en: "Working visit 2019 — Dubai", ar: "زيارة عمل ٢٠١٩ — دبي" },
    ],
    previousGifts: [
      { en: "Heritage falcon sculpture (2021)", ar: "مجسّم الصقر التراثي (٢٠٢١)" },
      { en: "Calligraphy panel (2019)", ar: "لوحة خط عربي (٢٠١٩)" },
    ],
    preferences: [
      { en: "Bilateral session preferred before the banquet", ar: "تفضيل جلسة ثنائية قبل المأدبة" },
      { en: "Vegetarian menu option required", ar: "مطلوب خيار نباتي في القائمة" },
    ],
    cultural: [
      { en: "Formal French protocol; address as ‘Monsieur le Président’", ar: "بروتوكول فرنسي رسمي؛ المخاطبة بـ ‘سيادة الرئيس’" },
      { en: "Punctuality strongly valued", ar: "الالتزام بالمواعيد ذو أهمية بالغة" },
    ],
    reciprocity: [
      { en: "UAE state dinner 2021 — reciprocated in Paris 2022", ar: "مأدبة دولة إماراتية ٢٠٢١ — قوبلت بالمثل في باريس ٢٠٢٢" },
      { en: "Gift exchange expected at parity", ar: "يُتوقّع تبادل الهدايا بتكافؤ" },
    ],
    lessons: [
      { en: "Confirm interpreter 72h ahead", ar: "تأكيد المترجم قبل ٧٢ ساعة" },
      { en: "Pre-clear the media list with the embassy", ar: "اعتماد قائمة الإعلام مسبقاً مع السفارة" },
    ],
    preferredProtocol: [
      { en: "Full state honours; red carpet & anthem", ar: "مراسم دولة كاملة؛ سجادة حمراء ونشيد" },
      { en: "Bilateral before any multilateral session", ar: "ثنائية قبل أي جلسة متعددة الأطراف" },
    ],
    meetingPreferences: [{ en: "Short, substantive sessions; agenda shared 48h prior", ar: "جلسات قصيرة وجوهرية؛ الأجندة قبل ٤٨ ساعة" }],
    interpreterHistory: [{ en: "French↔Arabic interpreter used in 2021 & 2019", ar: "مترجم فرنسي↔عربي في ٢٠٢١ و٢٠١٩" }],
    seating: [{ en: "Head table center; aide on the right", ar: "وسط الطاولة الرئيسية؛ المساعد على اليمين" }],
    meals: [{ en: "Vegetarian option; no shellfish", ar: "خيار نباتي؛ بدون محار" }],
    religious: [{ en: "No specific requirements on record", ar: "لا متطلبات خاصة مسجّلة" }],
    securityPrefs: [{ en: "Own close-protection team coordinates with hosts", ar: "فريق حماية خاص ينسّق مع المضيف" }],
    mediaRestrictions: [{ en: "No filming during the bilateral session", ar: "ممنوع التصوير أثناء الجلسة الثنائية" }],
    transportPrefs: [{ en: "Armored sedan; minimal motorcade footprint", ar: "سيارة مصفّحة؛ موكب بأقل حجم" }],
    executiveRelationships: [{ en: "Strong rapport with the Chairman since 2019", ar: "علاقة قوية مع رئيس الهيئة منذ ٢٠١٩" }],
    commonRisks: [{ en: "Tight arrival windows; media scheduling pressure", ar: "نوافذ وصول ضيّقة؛ ضغط جدولة الإعلام" }],
  },
  JP: {
    countryCode: "JP",
    previousVisits: [{ en: "Economic visit 2022 — Abu Dhabi", ar: "زيارة اقتصادية ٢٠٢٢ — أبوظبي" }],
    previousGifts: [{ en: "Pearl-inlay box (2022)", ar: "صندوق مطعّم باللؤلؤ (٢٠٢٢)" }],
    preferences: [{ en: "Exchange business cards with both hands", ar: "تبادل البطاقات باليدين" }],
    cultural: [{ en: "Bow on greeting; strict punctuality", ar: "الانحناء عند التحية؛ دقّة في المواعيد" }],
    reciprocity: [{ en: "Trade MoU signed 2022", ar: "توقيع مذكرة تجارة ٢٠٢٢" }],
    lessons: [{ en: "Allow extra time for the signing ceremony", ar: "تخصيص وقت إضافي لمراسم التوقيع" }],
  },
  SA: {
    countryCode: "SA",
    previousVisits: [{ en: "GCC summit 2023 — Abu Dhabi", ar: "قمة خليجية ٢٠٢٣ — أبوظبي" }],
    previousGifts: [{ en: "Premium oud set (2023)", ar: "طقم عود فاخر (٢٠٢٣)" }],
    preferences: [{ en: "Large delegation; majlis seating", ar: "وفد كبير؛ جلوس على طراز المجلس" }],
    cultural: [{ en: "Gulf royal protocol; right-hand greeting", ar: "بروتوكول ملكي خليجي؛ التحية باليد اليمنى" }],
    reciprocity: [{ en: "Reciprocal state hospitality ongoing", ar: "ضيافة دولة متبادلة مستمرة" }],
    lessons: [{ en: "Coordinate enhanced security tier early", ar: "تنسيق المستوى الأمني المعزّز مبكراً" }],
  },
  CN: {
    countryCode: "CN",
    previousVisits: [{ en: "Trade delegation 2022 — Dubai", ar: "وفد تجاري ٢٠٢٢ — دبي" }],
    previousGifts: [{ en: "Fine porcelain tea set (2022)", ar: "طقم شاي خزفي فاخر (٢٠٢٢)" }],
    preferences: [{ en: "Address by full official title", ar: "المخاطبة باللقب الرسمي الكامل" }],
    cultural: [{ en: "Punctuality valued; formal seating", ar: "تقدير المواعيد؛ جلوس رسمي" }],
    reciprocity: [{ en: "Investment forum reciprocity expected", ar: "يُتوقّع تبادل في منتدى الاستثمار" }],
    lessons: [{ en: "Confirm interpreter and signing logistics", ar: "تأكيد المترجم وترتيبات التوقيع" }],
  },
};

export function getMemory(ctx: MissionContext): DiplomaticMemory | null {
  return ctx.countryCode ? MEMORY[ctx.countryCode] ?? null : null;
}
