import { expect, test } from "@playwright/test";

test.use({ locale: "fr-FR" });

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
  await page.getByLabel("E-mail", { exact: true }).fill("exemple@example.com");
  await page.getByLabel("Sujet").fill("Question");
  await page.getByLabel("Message").fill("Bonjour, ceci est un test.");
  await page.getByRole("button", { name: "Envoyer le message" }).click();

  const notifications = page.getByRole("region", { name: "Notifications (F8)" });
  await expect(notifications.getByText("Message enregistré, notification non envoyée")).toBeVisible();
  await expect(notifications.getByText("Message envoyé !")).toHaveCount(0);
});

for (const acknowledgementSent of [true, false]) {
  test(`the contact form reports receipt ${acknowledgementSent ? "success" : "failure"}`, async ({ page }) => {
    await page.route("**/api/contact", async (route) => {
      await route.fulfill({
        status: 201, contentType: "application/json",
        body: JSON.stringify({ notificationSent: true, acknowledgementSent }),
      });
    });
    await page.goto("/contact");
    await page.getByLabel("Nom complet").fill("Exemple");
    await page.getByLabel("E-mail", { exact: true }).fill("exemple@example.com");
    await page.getByLabel("Sujet").fill("Question");
    await page.getByLabel("Message").fill("Bonjour, ceci est un test.");
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByRole("region", { name: "Notifications (F8)" }).getByText("Message envoyé !")).toBeVisible();
    await expect(page.getByRole("region", { name: "Notifications (F8)" }).getByText(acknowledgementSent
      ? /Un accusé de réception a été envoyé/
      : /L’accusé de réception n’a pas pu être envoyé/)).toBeVisible();
  });
}