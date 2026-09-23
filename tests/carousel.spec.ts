import { expect, test, type Locator } from "@playwright/test";

const carouselImage = /\/image_\d+(?:-720)?\.webp$/;

async function loadedSlide(slide: Locator, expectedVariant: "720" | "960") {
  await expect(slide).toBeVisible();
  await expect.poll(() => slide.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const selected = await slide.evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(new URL(selected).pathname).toMatch(
    expectedVariant === "720" ? /-720\.webp$/ : /(?<!-720)\.webp$/,
  );
  return new URL(selected).pathname;
}

test("the homepage only fetches selected carousel slides and chooses responsive images", async ({ page }, testInfo) => {
  const variant = testInfo.project.name === "mobile" ? "720" : "960";
  const requested: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (request.resourceType() === "image" && carouselImage.test(path)) requested.push(path);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  // Give the lazy sections time to mount if a future change makes them eager.
  await page.waitForTimeout(500);
  expect(requested, "off-screen slides must not download on initial load").toEqual([]);

  await page.locator("#product").scrollIntoViewIfNeeded();
  const aacFirst = await loadedSlide(page.getByRole("img", { name: "AuxArmesCitoyens.fr - Capture 1" }), variant);
  await page.locator("#product + section").scrollIntoViewIfNeeded();
  const charteFirst = await loadedSlide(page.getByRole("img", { name: "Charte pour la Souveraineté Populaire - Capture 1" }), variant);
  await page.waitForTimeout(500);
  expect(requested.length, "only the selected slide of each carousel should be fetched").toBe(2);
  expect(new Set(requested)).toEqual(new Set([aacFirst, charteFirst]));

  // Both carousels should remain usable: desktop arrows and mobile dot controls.
  for (const [id, prefix] of [
    ["aac", "AuxArmesCitoyens.fr"],
    ["charte", "Charte pour la Souveraineté Populaire"],
  ] as const) {
    const second = page.getByRole("img", { name: `${prefix} - Capture 2` });
    if (testInfo.project.name === "desktop") {
      await page.getByTestId(`button-${id}-carousel-next`).click();
    } else {
      await page.getByTestId(`button-${id}-carousel-dot-1`).click();
    }
    await loadedSlide(second, variant);
    if (testInfo.project.name === "desktop") {
      await page.getByTestId(`button-${id}-carousel-prev`).click();
    } else {
      await page.getByTestId(`button-${id}-carousel-dot-0`).click();
    }
    await loadedSlide(page.getByRole("img", { name: `${prefix} - Capture 1` }), variant);
  }
});