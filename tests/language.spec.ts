import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

test("a first visit follows the browser language, with French for unsupported languages", async ({ browser }) => {
  for (const [locale, expected] of [
    ["fr-CA", "fr"],
    ["en-US", "en"],
    ["it-IT", "it"],
    ["de-AT", "de"],
    ["es-MX", "es"],
    ["pt-BR", "fr"],
  ]) {
    const context = await browser.newContext({ locale });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await expect(page.locator("html")).toHaveAttribute("lang", expected);
      await expect(page.locator('[data-testid="language-switcher"]:visible svg[data-flag]')).toHaveAttribute("data-flag", expected);
      expect(await page.evaluate(() => localStorage.getItem("citizarm-language-selection"))).toBeNull();
    } finally {
      await context.close();
    }
  }

  const context = await browser.newContext({ locale: "en-US" });
  try {
    // Older versions wrote French even without an explicit choice.
    await context.addInitScript(() => localStorage.setItem("citizarm-language", "fr"));
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.locator('[data-testid="language-switcher"]:visible').click();
    await page.getByRole("menuitem", { name: "Français" }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    expect(await page.evaluate(() => localStorage.getItem("citizarm-language-selection"))).toBe("fr");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  } finally {
    await context.close();
  }
});

test("the flag menu switches all five languages and keeps the choice across pages and reloads", async ({ page }) => {
  await page.goto("/");
  const flag = page.locator('[data-testid="language-switcher"]:visible');
  await expect(flag.locator("svg[data-flag]")).toHaveAttribute("data-flag", "fr");
  const flagBounds = await flag.boundingBox();
  expect(flagBounds).not.toBeNull();
  expect(flagBounds!.x + flagBounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);

  for (const [name, code, title] of [
    ["English", "en", "Empowering minds for democracy"],
    ["Italiano", "it", "Dare forza alle menti per la democrazia"],
    ["Deutsch", "de", "Menschen befähigen, Demokratie zu gestalten"],
    ["Español", "es", "Fortalecer las mentes para la democracia"],
    ["Français", "fr", "Armer les esprits pour la démocratie"],
  ]) {
    await flag.click();
    await expect(page.getByRole("menuitem", { name }).locator("svg[data-flag]")).toHaveAttribute("data-flag", code);
    await page.getByRole("menuitem", { name }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", code);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(flag.locator("svg[data-flag]")).toHaveAttribute("data-flag", code);
  }

  await flag.click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page).toHaveTitle("CitiZarm - Empowering minds for democracy");
  await page.goto("/contact");
  await expect(page.getByText("Have a question?")).toBeVisible();
  await expect(page.getByLabel("Full name")).toBeVisible();
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText("Have a question?")).toBeVisible();
  await page.goto("/mentions-legales");
  await expect(page.getByRole("heading", { name: "Legal notice" })).toBeVisible();
});

test("the language menu has an opaque background in light and dark modes", async ({ page }) => {
  const backgrounds: string[] = [];
  for (const theme of ["light", "dark"]) {
    await page.goto("/");
    await page.evaluate((value) => localStorage.setItem("theme", value), theme);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`));

    const flag = page.locator('[data-testid="language-switcher"]:visible');
    const triggerBackground = await flag.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(triggerBackground).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    await flag.hover();
    await expect(flag).toHaveCSS("background-color", triggerBackground);

    await flag.click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    const menuBackground = await menu.evaluate((element) => getComputedStyle(element).backgroundColor);
    expect(menuBackground).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    backgrounds.push(menuBackground);
  }
  expect(backgrounds[0]).not.toBe(backgrounds[1]);
});