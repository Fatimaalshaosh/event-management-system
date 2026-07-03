import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import type {
  Event,
  Visit,
  Approval,
  Task,
  Report,
  DashboardSummary,
  EventReadiness,
} from "@workspace/api-client-react";
import { renderPage, queryResult, mutationResult } from "@/test/render-page";
import i18n from "@/i18n";

const hooks = vi.hoisted(() => ({
  useGetDashboardSummary: vi.fn(),
  useListEvents: vi.fn(),
  useListVisits: vi.fn(),
  useListApprovals: vi.fn(),
  useListTasks: vi.fn(),
  useListReports: vi.fn(),
  useGetEventReadiness: vi.fn(),
  useCreateReport: vi.fn(),
  useUpdateApproval: vi.fn(),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/api-client-react")>();
  return { ...actual, ...hooks };
});

// The dashboard board is laid out from server-stored profiles. Replace the
// layout hook with a static default layout so every widget renders without
// needing the profile CRUD endpoints.
vi.mock("@/components/dashboard/use-dashboard-layout", async () => {
  const { DEFAULT_ITEMS } = await import("@/components/dashboard/widget-meta");
  return {
    useDashboardLayout: () => ({
      loading: false,
      seeding: false,
      profiles: [],
      activeProfile: undefined,
      activeId: null,
      items: DEFAULT_ITEMS,
      visibleItems: DEFAULT_ITEMS.filter((w) => !w.hidden),
      dirty: false,
      saving: false,
      locked: false,
      toggleLock: () => {},
      hide: () => {},
      show: () => {},
      resetToDefault: () => {},
      saveNow: () => {},
      switchProfile: () => {},
      createProfile: () => {},
      duplicateProfile: () => {},
      renameProfile: () => {},
      deleteProfile: () => {},
    }),
  };
});

import Dashboard from "./dashboard";

const summary: DashboardSummary = {
  upcomingEvents: 5,
  officialVisits: 3,
  pendingRequests: 2,
  pendingApprovals: 2,
  logistics: {
    travel: 4,
    hotel: 6,
    fleet: 2,
    gifts: 1,
    documents: 8,
    budgetEstimated: 100000,
    budgetActual: 90000,
    currency: "AED",
  },
  budgetAlerts: [],
};

function makeEvent(over: Partial<Event> = {}): Event {
  return {
    id: 1,
    name: "State Banquet",
    nameAr: "مأدبة رسمية",
    date: "2026-07-01T18:00:00",
    location: "Qasr Al Watan",
    locationAr: "قصر الوطن",
    status: "confirmed",
    readinessPercent: 80,
    ...over,
  };
}

const visit: Visit = {
  id: 1,
  guestName: "President of France",
  guestNameAr: "رئيس فرنسا",
  country: "France",
  countryAr: "فرنسا",
  arrivalDate: "2026-07-01T09:00:00",
  status: "confirmed",
};

const approval: Approval = {
  id: 1,
  title: "Motorcade route",
  titleAr: "مسار الموكب",
  requestedBy: "Protocol Office",
  status: "pending",
  createdAt: "2026-06-20T09:00:00",
};

const task: Task = {
  id: 1,
  title: "Confirm seating",
  titleAr: "تأكيد الجلوس",
  status: "open",
  priority: "high",
  category: "protocol",
  readinessImpact: 10,
  dueDate: "2026-06-30T09:00:00",
};

const report: Report = {
  id: 1,
  name: "Weekly readiness",
  nameAr: "الجاهزية الأسبوعية",
  type: "summary",
  format: "pdf",
  createdAt: "2026-06-20T09:00:00",
};

const readiness: EventReadiness = {
  eventId: 1,
  overallPercent: 80,
  categories: [
    { name: "protocol", nameAr: "البروتوكول", status: "confirmed", percent: 90 },
    { name: "security", nameAr: "الأمن", status: "pending", percent: 70 },
  ],
};

function setData({
  events = [makeEvent()],
  visits = [visit],
  approvals = [approval],
  tasks = [task],
  reports = [report],
  loading = false,
}: {
  events?: Event[];
  visits?: Visit[];
  approvals?: Approval[];
  tasks?: Task[];
  reports?: Report[];
  loading?: boolean;
} = {}) {
  hooks.useGetDashboardSummary.mockReturnValue(queryResult(loading ? undefined : summary, loading));
  hooks.useListEvents.mockReturnValue(queryResult(loading ? undefined : events, loading));
  hooks.useListVisits.mockReturnValue(queryResult(loading ? undefined : visits, loading));
  hooks.useListApprovals.mockReturnValue(queryResult(loading ? undefined : approvals, loading));
  hooks.useListTasks.mockReturnValue(queryResult(loading ? undefined : tasks, loading));
  hooks.useListReports.mockReturnValue(queryResult(loading ? undefined : reports, loading));
  hooks.useGetEventReadiness.mockReturnValue(queryResult(loading ? undefined : readiness, loading));
}

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("ar");
  hooks.useCreateReport.mockReturnValue(mutationResult());
  hooks.useUpdateApproval.mockReturnValue(mutationResult());
  setData();
});

describe("Dashboard page", () => {
  it("renders key section headings from mocked data", () => {
    renderPage(<Dashboard />);
    expect(screen.getByText(i18n.t("dashboard.sections.eventReadiness"))).toBeInTheDocument();
    expect(screen.getAllByText(i18n.t("dashboard.sections.officialVisits")).length).toBeGreaterThan(0);
    expect(screen.getByText(i18n.t("dashboard.sections.upcomingTasks"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("dashboard.sections.pendingApprovals"))).toBeInTheDocument();
  });

  it("renders visit and task content from the mocked API", () => {
    renderPage(<Dashboard />);
    expect(screen.getByText("رئيس فرنسا")).toBeInTheDocument();
    expect(screen.getByText("تأكيد الجلوس")).toBeInTheDocument();
    expect(screen.getByText("مسار الموكب")).toBeInTheDocument();
  });

  it("shows loading skeletons while data is loading", () => {
    setData({ loading: true });
    const { container } = renderPage(<Dashboard />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows the empty state when there are no pending approvals", () => {
    setData({ approvals: [] });
    renderPage(<Dashboard />);
    expect(
      screen.getByText(i18n.t("dashboard.sections.noPendingApprovals")),
    ).toBeInTheDocument();
  });

  it("shows the empty state when there are no open tasks", () => {
    setData({ tasks: [{ ...task, status: "completed" }] });
    renderPage(<Dashboard />);
    expect(screen.getByText(i18n.t("dashboard.tasks.empty"))).toBeInTheDocument();
  });
});
