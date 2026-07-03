import type { DepartmentPlaybook } from "./types";

/**
 * Department playbooks — each department's operational knowledge package
 * (not generic subtasks). Bilingual content data, keyed by org-structure dept.
 */
export const PLAYBOOKS: DepartmentPlaybook[] = [
  {
    deptKey: "protocol",
    items: [
      { en: "VIP reception sequence", ar: "تسلسل استقبال كبار الشخصيات" },
      { en: "Seating order & precedence", ar: "ترتيب الجلوس والأسبقية" },
      { en: "Gifts & exchange protocol", ar: "بروتوكول الهدايا والتبادل" },
      { en: "Titles & formal salutation", ar: "الألقاب وصيغة المخاطبة" },
      { en: "Flags & national anthem", ar: "الأعلام والنشيد الوطني" },
      { en: "Arrival & departure protocol", ar: "بروتوكول الوصول والمغادرة" },
      { en: "Meeting room protocol", ar: "بروتوكول قاعة الاجتماعات" },
      { en: "Official photo protocol", ar: "بروتوكول الصورة الرسمية" },
      { en: "Guest greeting order", ar: "ترتيب استقبال الضيوف" },
      { en: "Cultural notes", ar: "ملاحظات ثقافية" },
    ],
  },
  {
    deptKey: "logistics",
    items: [
      { en: "Flights & arrival coordination", ar: "تنسيق الرحلات والوصول" },
      { en: "Airport reception & VIP lounge", ar: "استقبال المطار وصالة كبار الشخصيات" },
      { en: "Hotels & accommodation", ar: "الفنادق والإقامة" },
      { en: "Transport & vehicle assignment", ar: "النقل وإسناد المركبات" },
      { en: "Drivers & route coordination", ar: "السائقون وتنسيق المسار" },
      { en: "Baggage coordination", ar: "تنسيق الأمتعة" },
      { en: "Contingency transport", ar: "النقل الاحتياطي" },
    ],
  },
  {
    deptKey: "operations",
    items: [
      { en: "Live operations room", ar: "غرفة العمليات المباشرة" },
      { en: "Timeline monitoring", ar: "مراقبة الجدول الزمني" },
      { en: "Guest list clearance", ar: "اعتماد قائمة الضيوف" },
      { en: "Movement & escort plan", ar: "خطة الحركة والمرافقة" },
      { en: "Access control & sweeps", ar: "التحكم بالدخول والتفتيش" },
      { en: "Escalation & incident response", ar: "التصعيد والاستجابة للحوادث" },
      { en: "Readiness report & daily brief", ar: "تقرير الجاهزية والإحاطة اليومية" },
    ],
  },
  {
    deptKey: "media",
    items: [
      { en: "Photography & videography", ar: "التصوير الفوتوغرافي والمرئي" },
      { en: "Press release & official statement", ar: "البيان الصحفي والتصريح الرسمي" },
      { en: "Media center & accreditation", ar: "المركز الإعلامي والاعتماد" },
      { en: "Photo opportunity & embargo", ar: "فرصة التصوير والحظر الزمني" },
      { en: "Social content", ar: "المحتوى الاجتماعي" },
      { en: "Media coverage plan", ar: "خطة التغطية الإعلامية" },
    ],
  },
  {
    deptKey: "agenda",
    items: [
      { en: "Official program", ar: "البرنامج الرسمي" },
      { en: "Meeting schedule", ar: "جدول الاجتماعات" },
      { en: "VIP calendar", ar: "أجندة كبار الشخصيات" },
      { en: "Ceremony sequence", ar: "تسلسل المراسم" },
      { en: "Executive availability", ar: "توفر القيادة التنفيذية" },
      { en: "Time-conflict resolution", ar: "حل تعارضات الوقت" },
    ],
  },
  {
    deptKey: "it",
    items: [
      { en: "QR check-in", ar: "تسجيل الدخول برمز QR" },
      { en: "Screens & digital signage", ar: "الشاشات واللافتات الرقمية" },
      { en: "AV support", ar: "الدعم الصوتي والمرئي" },
      { en: "Network readiness", ar: "جاهزية الشبكة" },
      { en: "Access badges", ar: "بطاقات الدخول" },
      { en: "System & platform support", ar: "دعم الأنظمة والمنصات" },
    ],
  },
  {
    deptKey: "finance",
    items: [
      { en: "Budget review", ar: "مراجعة الميزانية" },
      { en: "Cost tracking", ar: "تتبع التكاليف" },
      { en: "Payment approvals", ar: "اعتماد المدفوعات" },
      { en: "Budget variance & financial risk", ar: "انحراف الميزانية والمخاطر المالية" },
    ],
  },
  {
    deptKey: "procurement",
    items: [
      { en: "Vendor request", ar: "طلب المورّد" },
      { en: "Quotations", ar: "عروض الأسعار" },
      { en: "Contract review", ar: "مراجعة العقود" },
      { en: "PO / PR status", ar: "حالة أوامر وطلبات الشراء" },
      { en: "Vendor readiness", ar: "جاهزية المورّدين" },
    ],
  },
  {
    deptKey: "generalServices",
    items: [
      { en: "Venue setup", ar: "تجهيز المكان" },
      { en: "Catering & hospitality", ar: "الضيافة والتموين" },
      { en: "Majlis setup", ar: "تجهيز المجلس" },
      { en: "Furniture & housekeeping", ar: "الأثاث والتدبير المنزلي" },
      { en: "Cleaning & guest services", ar: "النظافة وخدمات الضيوف" },
    ],
  },
  {
    deptKey: "planning",
    items: [
      { en: "Master timeline", ar: "الجدول الزمني الرئيسي" },
      { en: "Risk assessment", ar: "تقييم المخاطر" },
      { en: "Readiness model", ar: "نموذج الجاهزية" },
      { en: "Milestone tracking", ar: "تتبع المحطات" },
    ],
  },
  {
    deptKey: "chairmanOffice",
    items: [
      { en: "Final executive visibility", ar: "الإشراف التنفيذي النهائي" },
      { en: "Executive sign-off", ar: "الاعتماد التنفيذي" },
    ],
  },
  {
    deptKey: "secretaryGeneral",
    items: [
      { en: "Executive coordination", ar: "التنسيق التنفيذي" },
      { en: "Cross-sector alignment", ar: "المواءمة بين القطاعات" },
    ],
  },
];

export const PLAYBOOK_BY_DEPT = Object.fromEntries(PLAYBOOKS.map((p) => [p.deptKey, p]));
