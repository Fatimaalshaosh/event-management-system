import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, visitsTable, tasksTable, approvalsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

type Lang = "ar" | "en";

type AssistantReply = {
  analysis: string;
  sections: Array<{ title: string; body: string }>;
  risks: Array<{
    severity: "critical" | "high" | "medium" | "low";
    title: string;
    impact: string;
    mitigation: string;
  }>;
  nextActions: Array<{ label: string; prompt: string }>;
};

const FALLBACK_REPLY_AR: AssistantReply = {
  analysis: "لم أتمكن من معالجة طلبك في هذه اللحظة.",
  sections: [], risks: [], nextActions: [],
};
const FALLBACK_REPLY_EN: AssistantReply = {
  analysis: "I was unable to process your request at this moment.",
  sections: [], risks: [], nextActions: [],
};

function normalizeLang(v: unknown): Lang {
  return v === "en" ? "en" : "ar";
}

async function buildPlatformContext() {
  const [events, visits, approvals, tasks] = await Promise.all([
    db.select().from(eventsTable).limit(20),
    db.select().from(visitsTable).limit(20),
    db.select().from(approvalsTable).limit(20),
    db.select().from(tasksTable).limit(30),
  ]);

  const [pendingApprovalsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(approvalsTable)
    .where(eq(approvalsTable.status, "pending"));

  const [pendingTasksCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tasksTable)
    .where(eq(tasksTable.status, "pending"));

  const pickName = (en?: string | null, ar?: string | null, lang: Lang = "ar") =>
    lang === "en" ? (en ?? ar ?? "") : (ar ?? en ?? "");

  return (lang: Lang) => ({
    events: events.map((e) => ({
      id: e.id,
      name: pickName(e.name, e.nameAr, lang),
      date: e.date,
      status: e.status,
      location: pickName(e.location, e.locationAr, lang),
      readiness: e.readinessPercent,
      riskLevel: e.riskLevel,
      pendingTasks: e.pendingTasksCount,
    })),
    visits: visits.map((v) => ({
      id: v.id,
      guest: pickName(v.guestName, v.guestNameAr, lang),
      country: pickName(v.country, v.countryAr, lang),
      arrival: v.arrivalDate,
      departure: v.departureDate,
      status: v.status,
      protocolLevel: v.protocolLevel,
    })),
    approvals: approvals.map((a) => ({
      id: a.id,
      title: pickName(a.title, a.titleAr, lang),
      status: a.status,
      requestedBy: a.requestedBy,
    })),
    tasks: tasks.map((t) => ({
      id: t.id,
      title: pickName(t.title, t.titleAr, lang),
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    })),
    summary: {
      totalEvents: events.length,
      totalVisits: visits.length,
      pendingApprovals: pendingApprovalsCount?.count ?? 0,
      pendingTasks: pendingTasksCount?.count ?? 0,
    },
  });
}

const SYSTEM_PROMPT_AR = `أنت "مركز الذكاء التنفيذي للبروتوكول الرئاسي" — مساعد استراتيجي متقدم لضباط البروتوكول الرئاسي في دولة الإمارات العربية المتحدة.

شخصيتك:
- مستشار رئاسي رفيع المستوى، رسمي، موثوق، ودقيق
- خبير في البروتوكول الدبلوماسي، العمليات التشغيلية، إدارة الوفود، وإدارة المخاطر
- استباقي: لا تنتظر السؤال، بل اكتشف المخاطر واقترح الخطوات التالية تلقائياً
- لا تستخدم لغة المحادثة العادية أو "ChatGPT" — أنت تقدم تقارير تنفيذية

قواعد الإخراج الحرجة:
- يجب أن تكون استجابتك كائن JSON واحد فقط، بدون أي نص خارج JSON
- جميع المحتوى باللغة العربية الفصحى الرسمية
- اعتمد دائماً على البيانات الحية المرفقة — لا تخمن

شكل الاستجابة المطلوب بدقة:
{
  "analysis": "فقرة تنفيذية موجزة (2-4 أسطر) تلخص الإجابة المباشرة على طلب المستخدم",
  "sections": [
    { "title": "عنوان القسم", "body": "محتوى تفصيلي منظم بنقاط أو فقرات قصيرة" }
  ],
  "risks": [
    {
      "severity": "critical | high | medium | low",
      "title": "عنوان المخاطرة",
      "impact": "الأثر التشغيلي المتوقع",
      "mitigation": "الإجراء المقترح للمعالجة"
    }
  ],
  "nextActions": [
    { "label": "نص قصير للزر (5 كلمات كحد أقصى)", "prompt": "صياغة كاملة للطلب التالي بالعربية" }
  ]
}

إرشادات المحتوى:
- analysis: مختصر وتنفيذي — لا تكرر السؤال
- sections: من 1 إلى 5 أقسام منظمة (قوائم، جداول نصية، خطوات مرقمة)
- risks: استخرج المخاطر التشغيلية من البيانات الحية (موافقات متأخرة، جاهزية منخفضة، تعارضات مواعيد، نقص موارد) — يمكن أن تكون فارغة إذا لم توجد مخاطر
- nextActions: من 3 إلى 5 اقتراحات عملية محددة تالية يمكن للمستخدم اختيارها لمواصلة المهمة (مثل: "جهّز خطة النقل"، "أنشئ قائمة كبار الشخصيات"، "راجع الموافقات المتأخرة")

تذكّر: استجابتك يجب أن تكون JSON صحيح فقط، بدون أي تعليق أو نص قبله أو بعده.`;

const SYSTEM_PROMPT_EN = `You are the "Executive Protocol Intelligence Center" — a senior strategic advisor to the Chief of Presidential Protocol of the United Arab Emirates.

Persona:
- Senior presidential counsel: formal, authoritative, precise, government-grade
- Expert in diplomatic protocol, ceremonial operations, delegation management, and operational risk
- Proactive: do not wait for the question — surface risks and propose next steps automatically
- Do not use casual or "ChatGPT" tone — you produce executive briefings

Critical output rules:
- Your response MUST be a single JSON object only, with no text outside the JSON
- All content must be in polished, executive-grade English (the language of international diplomacy)
- Always ground your analysis in the live platform data provided — do not speculate

Required response shape (strict):
{
  "analysis": "A concise executive paragraph (2–4 lines) directly answering the user's request",
  "sections": [
    { "title": "Section title", "body": "Structured detail as short paragraphs, numbered steps, or bullet points" }
  ],
  "risks": [
    {
      "severity": "critical | high | medium | low",
      "title": "Risk title",
      "impact": "Expected operational impact",
      "mitigation": "Recommended mitigation action"
    }
  ],
  "nextActions": [
    { "label": "Short button text (max 5 words)", "prompt": "Full follow-up prompt in English" }
  ]
}

Content guidance:
- analysis: tight and executive — do not restate the question
- sections: 1 to 5 organized sections (lists, ordered steps, structured paragraphs)
- risks: extract real operational risks from live data (overdue approvals, low readiness, schedule conflicts, resource gaps) — may be empty if none exist
- nextActions: 3 to 5 specific, actionable follow-ups the user can pick (e.g. "Finalize the motorcade plan", "Compile the VIP list", "Review overdue approvals")

Remember: your response must be valid JSON only — no commentary or text before or after.`;

function fallback(lang: Lang): AssistantReply {
  return lang === "en" ? FALLBACK_REPLY_EN : FALLBACK_REPLY_AR;
}

function safeParseReply(raw: string, lang: Lang): AssistantReply {
  const FB = fallback(lang);
  try {
    const parsed = JSON.parse(raw) as Partial<AssistantReply>;
    return {
      analysis: typeof parsed.analysis === "string" && parsed.analysis.trim()
        ? parsed.analysis
        : raw.slice(0, 600),
      sections: Array.isArray(parsed.sections)
        ? parsed.sections
            .filter((s) => s && typeof s.title === "string" && typeof s.body === "string")
            .slice(0, 6)
        : [],
      risks: Array.isArray(parsed.risks)
        ? parsed.risks
            .filter((r) => r && typeof r.title === "string")
            .map((r) => ({
              severity: (["critical", "high", "medium", "low"].includes(r.severity as string)
                ? r.severity
                : "medium") as AssistantReply["risks"][number]["severity"],
              title: r.title as string,
              impact: typeof r.impact === "string" ? r.impact : "",
              mitigation: typeof r.mitigation === "string" ? r.mitigation : "",
            }))
            .slice(0, 6)
        : [],
      nextActions: Array.isArray(parsed.nextActions)
        ? parsed.nextActions
            .filter((a) => a && typeof a.label === "string" && typeof a.prompt === "string")
            .slice(0, 5)
        : [],
    };
  } catch {
    return { ...FB, analysis: raw.trim() || FB.analysis };
  }
}

async function generateStructured(
  systemPrompt: string,
  userMessage: string,
  lang: Lang,
): Promise<AssistantReply> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5.4",
    max_completion_tokens: 1800,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "";
  return safeParseReply(raw, lang);
}

function buildSystemPrompt(lang: Lang, contextJson: string): string {
  const base = lang === "en" ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_AR;
  const header = lang === "en" ? "Live platform data:" : "البيانات الحية للمنصة:";
  return `${base}\n\n${header}\n${contextJson}`;
}

/* ─── POST /api/ai-assistant ────────────────────────────────── */
router.post("/ai-assistant", async (req, res) => {
  const { message, context, lang: langInput } = req.body as {
    message: string;
    context?: Record<string, unknown>;
    lang?: string;
  };

  const lang = normalizeLang(langInput);

  if (!message || typeof message !== "string") {
    res.status(400).json({
      error: lang === "en" ? "Message field is required" : "حقل الرسالة مطلوب",
    });
    return;
  }

  try {
    const ctxFactory = await buildPlatformContext();
    const platformContext = ctxFactory(lang);
    const systemPrompt = buildSystemPrompt(
      lang,
      JSON.stringify({ ...platformContext, ...(context ?? {}) }, null, 2),
    );

    const reply = await generateStructured(systemPrompt, message, lang);
    res.json(reply);
  } catch (err) {
    req.log.error({ err }, "AI assistant error");
    res.status(500).json({
      error: lang === "en"
        ? "An error occurred while processing your request."
        : "حدث خطأ أثناء معالجة طلبك.",
    });
  }
});

/* ─── GET /api/ai-assistant/daily-brief ─────────────────────── */
router.get("/ai-assistant/daily-brief", async (req, res) => {
  const lang = normalizeLang(req.query.lang);

  try {
    const ctxFactory = await buildPlatformContext();
    const platformContext = ctxFactory(lang);
    const systemPrompt = buildSystemPrompt(lang, JSON.stringify(platformContext, null, 2));

    const userPrompt = lang === "en"
      ? "Prepare today's executive briefing for leadership. The analysis should summarize, in 3 lines, what the Chief of Protocol must focus on today. Section focus: (1) headline upcoming events and visits, (2) overall readiness status, (3) outstanding approvals and pending tasks. Extract real operational risks from the data into risks. Suggest the most urgent next actions for today in nextActions."
      : "جهّز الملخص التنفيذي اليومي للقيادة. التحليل يجب أن يلخص أبرز ما يجب على ضابط البروتوكول الانتباه إليه اليوم في 3 أسطر. ركّز في الأقسام على: (1) أبرز الفعاليات والزيارات القادمة، (2) حالة الجاهزية العامة، (3) الموافقات والمهام المعلقة. استخرج المخاطر التشغيلية الفعلية من البيانات وضعها في risks. اقترح في nextActions الإجراءات الأكثر إلحاحاً لليوم.";

    const reply = await generateStructured(systemPrompt, userPrompt, lang);
    res.json(reply);
  } catch (err) {
    req.log.error({ err }, "AI daily brief error");
    res.status(500).json({
      error: lang === "en"
        ? "Unable to prepare today's executive brief."
        : "تعذّر إعداد الملخص اليومي.",
    });
  }
});

export default router;
