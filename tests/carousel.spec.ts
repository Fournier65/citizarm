import { expect, test, type Locator } from "@playwright/test";

test.use({ locale: "fr-FR" });

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
  await page.locator("#product + section + section").scrollIntoViewIfNeeded();
  const revodemoFirst = await loadedSlide(page.getByRole("img", { name: "Révodémo - Capture 1" }), variant);
  expect(revodemoFirst).toContain("image_1790199115795");
  await expect(page.getByRole("link", { name: "Visiter Révodémo" })).toHaveAttribute("href", "https://revodemo.fr/fr");
  await page.waitForTimeout(500);
  expect(requested.length, "only the selected slide of each carousel should be fetched").toBe(3);
  expect(new Set(requested)).toEqual(new Set([aacFirst, charteFirst, revodemoFirst]));

  // All three carousels should remain usable: desktop arrows and mobile dot controls.
  for (const [id, prefix] of [
    ["aac", "AuxArmesCitoyens.fr"],
    ["charte", "Charte pour la Souveraineté Populaire"],
    ["revodemo", "Révodémo"],
  ] as const) {
    const second = page.getByRole("img", { name: `${prefix} - Capture 2` });
    if (testInfo.project.name === "desktop") {
      await page.getByTestId(`button-${id}-carousel-next`).click();
    } else {
      await page.getByTestId(`button-${id}-carousel-dot-1`).click();
    }
    const secondSrc = await loadedSlide(second, variant);
    if (id === "revodemo") expect(secondSrc).toContain("image_1790199142046");
    if (testInfo.project.name === "desktop") {
      await page.getByTestId(`button-${id}-carousel-prev`).click();
    } else {
      await page.getByTestId(`button-${id}-carousel-dot-0`).click();
    }
    await loadedSlide(page.getByRole("img", { name: `${prefix} - Capture 1` }), variant);
  }

  // The first five slides use the replacement captures; the sixth remains unchanged.
  for (const [index, imageId] of [
    [2, "1790199184539"],
    [3, "1790199217235"],
    [4, "1790199329365"],
    [5, "1790198858300"],
  ] as const) {
    await page.getByTestId(`button-revodemo-carousel-dot-${index}`).click();
    const src = await loadedSlide(page.getByRole("img", { name: `Révodémo - Capture ${index + 1}` }), variant);
    expect(src).toContain(`image_${imageId}`);
  }
});

test("the Révodémo carousel uses all six Italian screenshots only in Italian", async ({ page }, testInfo) => {
  const variant = testInfo.project.name === "mobile" ? "720" : "960";
  await page.goto("/");
  await page.locator("#product + section + section").scrollIntoViewIfNeeded();
  await loadedSlide(page.getByRole("img", { name: "Révodémo - Capture 1" }), variant);

  const flag = page.locator('[data-testid="language-switcher"]:visible');
  await flag.click();
  await page.getByRole("menuitem", { name: "Italiano" }).click();
  await expect(page.getByRole("menu")).toBeHidden();

  for (const [index, id] of [
    "1790280216448",
    "1790280248310",
    "1790280378094",
    "1790280411066",
    "1790280452665",
    "1790280499760",
  ].entries()) {
    if (index > 0) await page.getByTestId(`button-revodemo-carousel-dot-${index}`).click();
    const src = await loadedSlide(page.getByRole("img", { name: `Révodémo - Schermata ${index + 1}` }), variant);
    expect(src).toContain(`image_${id}`);
  }

  await flag.click();
  await page.getByRole("menuitem", { name: "Français" }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  const frenchSrc = await loadedSlide(page.getByRole("img", { name: "Révodémo - Capture 6" }), variant);
  expect(frenchSrc).toContain("image_1790198858300");
});

test("the Révodémo carousel uses all six English screenshots only in English", async ({ page }, testInfo) => {
  const variant = testInfo.project.name === "mobile" ? "720" : "960";
  await page.goto("/");
  await page.locator("#product + section + section").scrollIntoViewIfNeeded();
  await loadedSlide(page.getByRole("img", { name: "Révodémo - Capture 1" }), variant);

  const flag = page.locator('[data-testid="language-switcher"]:visible');
  await flag.click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page.getByRole("menu")).toBeHidden();

  for (const [index, id] of [
    "1790280579731",
    "1790280581603",
    "1790280675822",
    "1790280706849",
    "1790280727693",
    "1790280795773",
  ].entries()) {
    if (index > 0) await page.getByTestId(`button-revodemo-carousel-dot-${index}`).click();
    const src = await loadedSlide(page.getByRole("img", { name: `Révodémo - Screenshot ${index + 1}` }), variant);
    expect(src).toContain(`image_${id}`);
  }

  await flag.click();
  await page.getByRole("menuitem", { name: "Italiano" }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  const italianSrc = await loadedSlide(page.getByRole("img", { name: "Révodémo - Schermata 6" }), variant);
  expect(italianSrc).toContain("image_1790280499760");
});

test("the Révodémo carousel uses all six German screenshots only in German", async ({ page }, testInfo) => {
  const variant = testInfo.project.name === "mobile" ? "720" : "960";
  await page.goto("/");
  await page.locator("#product + section + section").scrollIntoViewIfNeeded();
  await loadedSlide(page.getByRole("img", { name: "Révodémo - Capture 1" }), variant);

  const flag = page.locator('[data-testid="language-switcher"]:visible');
  await flag.click();
  await page.getByRole("menuitem", { name: "Deutsch" }).click();
  await expect(page.getByRole("menu")).toBeHidden();

  for (const [index, id] of [
    "1790280916099",
    "1790280935596",
    "1790280968784",
    "1790281151306",
    "1790281179465",
    "1790281208761",
  ].entries()) {
    if (index > 0) await page.getByTestId(`button-revodemo-carousel-dot-${index}`).click();
    const src = await loadedSlide(page.getByRole("img", { name: `Révodémo - Bildschirmaufnahme ${index + 1}` }), variant);
    expect(src).toContain(`image_${id}`);
  }

  await flag.click();
  await page.getByRole("menuitem", { name: "English" }).click();
  await expect(page.getByRole("menu")).toBeHidden();
  const englishSrc = await loadedSlide(page.getByRole("img", { name: "Révodémo - Screenshot 6" }), variant);
  expect(englishSrc).toContain("image_1790280795773");
});