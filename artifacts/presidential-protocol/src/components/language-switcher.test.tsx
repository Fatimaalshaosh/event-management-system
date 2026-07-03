import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "./language-switcher";
import { LanguageProvider } from "@/i18n/language-context";
import i18n from "@/i18n";

function renderSwitcher() {
  return render(
    <LanguageProvider>
      <LanguageSwitcher />
    </LanguageProvider>,
  );
}

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("ar");
});

describe("LanguageSwitcher", () => {
  it("renders both language options", () => {
    renderSwitcher();
    const group = screen.getByRole("group", { name: /language switcher/i });
    expect(within(group).getByText("العربية")).toBeInTheDocument();
    expect(within(group).getByText("English")).toBeInTheDocument();
  });

  it("marks Arabic as active by default and updates the document direction", () => {
    renderSwitcher();
    const arabic = screen.getByText("العربية").closest("button")!;
    expect(arabic).toHaveAttribute("aria-pressed", "true");
  });

  it("switches to English, updates aria-pressed, dir, and persists the choice", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByText("English"));

    const english = screen.getByText("English").closest("button")!;
    expect(english).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.dir).toBe("ltr");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("pp_lang")).toBe("en");
  });

  it("switches back to Arabic and restores RTL", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByText("English"));
    await user.click(screen.getByText("العربية"));

    expect(document.documentElement.dir).toBe("rtl");
    expect(localStorage.getItem("pp_lang")).toBe("ar");
  });
});
