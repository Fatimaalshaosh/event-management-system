import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderPage, mutationResult } from "@/test/render-page";
import i18n from "@/i18n";

const hooks = vi.hoisted(() => ({
  useCreateEvent: vi.fn(),
  useUpdateEvent: vi.fn(),
}));

vi.mock("@workspace/api-client-react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@workspace/api-client-react")>();
  return { ...actual, ...hooks };
});

import EventsNew from "./events-new";

let createMutate: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.clearAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("ar");
  createMutate = vi.fn();
  hooks.useCreateEvent.mockReturnValue(mutationResult(createMutate));
  hooks.useUpdateEvent.mockReturnValue(mutationResult());
});

describe("Event create form", () => {
  it("renders the create heading and the save action in RTL", () => {
    renderPage(<EventsNew />, { path: "/events/new" });
    expect(
      screen.getByRole("heading", { name: i18n.t("pages.eventForm.createTitle") }),
    ).toBeInTheDocument();
    const form = document.querySelector('[dir="rtl"]');
    expect(form).not.toBeNull();
  });

  it("surfaces validation errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    renderPage(<EventsNew />, { path: "/events/new" });

    await user.click(
      screen.getByRole("button", { name: i18n.t("pages.eventForm.save") }),
    );

    expect(await screen.findByText(i18n.t("pages.eventForm.errors.nameAr"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("pages.eventForm.errors.nameEn"))).toBeInTheDocument();
    expect(screen.getByText(i18n.t("pages.eventForm.errors.date"))).toBeInTheDocument();
    expect(createMutate).not.toHaveBeenCalled();
  });

  it("submits valid input through the create mutation", async () => {
    const user = userEvent.setup();
    renderPage(<EventsNew />, { path: "/events/new" });

    await user.type(screen.getByText(i18n.t("pages.eventForm.nameAr")).parentElement!.querySelector("input")!, "مأدبة رسمية");
    await user.type(screen.getByText(i18n.t("pages.eventForm.nameEn")).parentElement!.querySelector("input")!, "State Banquet");
    await user.type(screen.getByText(i18n.t("pages.eventForm.locationAr")).parentElement!.querySelector("input")!, "قصر الوطن");
    await user.type(screen.getByText(i18n.t("pages.eventForm.locationEn")).parentElement!.querySelector("input")!, "Qasr Al Watan");

    const dateInput = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
    await user.type(dateInput, "2026-07-01T18:00");

    await user.click(
      screen.getByRole("button", { name: i18n.t("pages.eventForm.save") }),
    );

    await waitFor(() => expect(createMutate).toHaveBeenCalledTimes(1));
    const [payload] = createMutate.mock.calls[0];
    expect(payload).toMatchObject({
      data: expect.objectContaining({
        nameAr: "مأدبة رسمية",
        name: "State Banquet",
        locationAr: "قصر الوطن",
        location: "Qasr Al Watan",
      }),
    });
  });
});
