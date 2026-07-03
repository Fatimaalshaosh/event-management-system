import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Event } from "@workspace/api-client-react";
import { renderPage, queryResult, mutationResult } from "@/test/render-page";
import i18n from "@/i18n";

const hooks = vi.hoisted(() => ({
  useListEvents: vi.fn(),
  useUpdateEvent: vi.fn(),
  useGetReportsLogistics: vi.fn(),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/api-client-react")>();
  return { ...actual, ...hooks };
});

import Events from "./events";

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
    riskLevel: "low",
    priority: "high",
    vipLevel: "headOfState",
    country: "France",
    countryAr: "فرنسا",
    time: "18:00",
    eventType: "visitOfficial",
    watched: false,
    pinned: false,
    ...over,
  };
}

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("ar");
  hooks.useUpdateEvent.mockReturnValue(mutationResult());
  hooks.useGetReportsLogistics.mockReturnValue(queryResult(undefined));
});

describe("Events page", () => {
  it("shows skeleton placeholders while events are loading", () => {
    hooks.useListEvents.mockReturnValue(queryResult(undefined, true));
    const { container } = renderPage(<Events />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders the page title and the add-event action once loaded", () => {
    hooks.useListEvents.mockReturnValue(queryResult([makeEvent()]));
    renderPage(<Events />);
    expect(
      screen.getByRole("heading", { name: i18n.t("pages.events.title") }),
    ).toBeInTheDocument();
    expect(screen.getByText(i18n.t("pages.events.addEvent"))).toBeInTheDocument();
  });

  it("renders event content from the mocked API in the list view", async () => {
    const user = userEvent.setup();
    hooks.useListEvents.mockReturnValue(
      queryResult([
        makeEvent({ id: 1, nameAr: "مأدبة رسمية" }),
        makeEvent({ id: 2, nameAr: "استقبال وفد", name: "Delegation Reception", date: "2026-07-05T10:00:00" }),
      ]),
    );
    renderPage(<Events />);

    await user.click(screen.getByText(i18n.t("pages.events.views.list")));

    expect(await screen.findByText("مأدبة رسمية")).toBeInTheDocument();
    expect(screen.getByText("استقبال وفد")).toBeInTheDocument();
  });

  it("filters events by the search box", async () => {
    const user = userEvent.setup();
    hooks.useListEvents.mockReturnValue(
      queryResult([
        makeEvent({ id: 1, nameAr: "مأدبة رسمية" }),
        makeEvent({ id: 2, nameAr: "اجتماع تنسيقي", name: "Coordination Meeting", date: "2026-07-05T10:00:00" }),
      ]),
    );
    renderPage(<Events />);

    await user.click(screen.getByText(i18n.t("pages.events.views.list")));
    expect(await screen.findByText("مأدبة رسمية")).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText(i18n.t("pages.events.searchPh")),
      "اجتماع",
    );

    expect(screen.queryByText("مأدبة رسمية")).not.toBeInTheDocument();
    expect(screen.getByText("اجتماع تنسيقي")).toBeInTheDocument();
  });

  it("keeps cancelled events hidden until the officer reveals them", async () => {
    const user = userEvent.setup();
    hooks.useListEvents.mockReturnValue(
      queryResult([
        makeEvent({ id: 1, nameAr: "مأدبة رسمية", status: "confirmed" }),
        makeEvent({ id: 2, nameAr: "حدث ملغى", status: "cancelled", date: "2026-07-05T10:00:00" }),
      ]),
    );
    renderPage(<Events />);

    await user.click(screen.getByText(i18n.t("pages.events.views.list")));
    expect(await screen.findByText("مأدبة رسمية")).toBeInTheDocument();
    expect(screen.queryByText("حدث ملغى")).not.toBeInTheDocument();

    await user.click(
      screen.getByText(i18n.t("pages.events.cancelledHidden", { count: 1 })),
    );
    expect(await screen.findByText("حدث ملغى")).toBeInTheDocument();
  });

  it("renders in RTL by default reflecting the Arabic interface", () => {
    hooks.useListEvents.mockReturnValue(queryResult([makeEvent()]));
    renderPage(<Events />);
    const heading = screen.getByRole("heading", { name: i18n.t("pages.events.title") });
    const rtlContainer = heading.closest('[dir="rtl"]');
    expect(rtlContainer).not.toBeNull();
    expect(within(rtlContainer as HTMLElement).getByText(i18n.t("pages.events.title"))).toBeInTheDocument();
  });
});
