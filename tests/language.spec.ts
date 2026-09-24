import { expect, test } from "@playwright/test";

test("the flag menu switches all five languages and keeps the choice across pages and reloads", async ({ page }) => {
  await page.goto("/");
  const flag = page.locator('[data-testid="language-switcher"]:visible');
  await expect(flag).toContainText("🇫🇷");
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
    await page.getByRole("menuitem", { name }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", code);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(flag).not.toContainText(name === "Français" ? "🇬🇧" : "🇫🇷");
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