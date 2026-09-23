import { expect, test } from "@playwright/test";

test("the contact form warns when the message was saved but the email failed", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ notificationSent: false }),
    });
  });

  await page.goto("/contact");
  await page.getByLabel("Nom complet").fill("Exemple");
  await page.getByLabel("Email", { exact: true }).fill("exemple@example.com");
  await page.getByLabel("Sujet").fill("Question");
  await page.getByLabel("Message").fill("Bonjour, ceci est un test.");
  await page.getByRole("button", { name: "Envoyer le message" }).click();

  await expect(page.getByText("Message enregistré, notification non envoyée")).toBeVisible();
  await expect(page.getByText("Message envoyé !")).toHaveCount(0);
});