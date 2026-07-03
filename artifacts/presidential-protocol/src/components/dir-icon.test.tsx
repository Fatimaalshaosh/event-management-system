import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ChevronEnd, ChevronStart, ArrowEnd } from "./dir-icon";
import { LanguageProvider } from "@/i18n/language-context";
import i18n from "@/i18n";

function iconName(container: HTMLElement): string | null {
  return container.querySelector("svg")?.getAttribute("class") ?? null;
}

beforeEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("ar");
});

describe("direction-aware icons", () => {
  it("ChevronEnd points left (lucide-chevron-left) in RTL", async () => {
    await i18n.changeLanguage("ar");
    const { container } = render(
      <LanguageProvider>
        <ChevronEnd />
      </LanguageProvider>,
    );
    expect(iconName(container)).toContain("lucide-chevron-left");
  });

  it("ChevronEnd points right (lucide-chevron-right) in LTR", async () => {
    await i18n.changeLanguage("en");
    const { container } = render(
      <LanguageProvider>
        <ChevronEnd />
      </LanguageProvider>,
    );
    expect(iconName(container)).toContain("lucide-chevron-right");
  });

  it("ChevronStart is the mirror of ChevronEnd in RTL", async () => {
    await i18n.changeLanguage("ar");
    const { container } = render(
      <LanguageProvider>
        <ChevronStart />
      </LanguageProvider>,
    );
    expect(iconName(container)).toContain("lucide-chevron-right");
  });

  it("ArrowEnd points left in RTL", async () => {
    await i18n.changeLanguage("ar");
    const { container } = render(
      <LanguageProvider>
        <ArrowEnd />
      </LanguageProvider>,
    );
    expect(iconName(container)).toContain("lucide-arrow-left");
  });
});
