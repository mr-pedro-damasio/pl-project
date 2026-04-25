import { test, expect } from "@playwright/test";

test.describe("NDA Creator — golden path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with title and Download PDF button", async ({ page }) => {
    await expect(page.getByText("Mutual NDA Creator")).toBeVisible();
    await expect(page.getByRole("button", { name: /Download PDF/i })).toBeVisible();
  });

  test("renders the NDA document preview on load", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /Mutual Non-Disclosure Agreement/ })).toBeVisible();
  });

  test("typing in Purpose field updates the preview immediately", async ({ page }) => {
    const textarea = page.getByRole("textbox").first();
    await textarea.clear();
    await textarea.fill("Testing our new SaaS product.");
    await expect(page.locator(".field-value").filter({ hasText: "Testing our new SaaS product." }).first()).toBeVisible();
  });

  test("switching MNDA Term to 'until-terminated' updates the cover page", async ({ page }) => {
    await page.getByRole("radio", { name: /Continues until terminated/i }).click();
    await expect(page.getByText("Until terminated")).toBeVisible();
  });

  test("switching MNDA Term back to 'expires' restores year display", async ({ page }) => {
    await page.getByRole("radio", { name: /Continues until terminated/i }).click();
    await page.getByRole("radio", { name: /Expires after a fixed number of years/i }).click();
    await expect(page.getByText(/year.*from Effective Date/)).toBeVisible();
  });

  test("MNDA year number input is visible only when 'expires' is selected", async ({ page }) => {
    await expect(page.getByRole("spinbutton").first()).toBeVisible();
    await page.getByRole("radio", { name: /Continues until terminated/i }).click();
    await expect(page.getByRole("spinbutton")).toHaveCount(1);
  });

  test("confidentiality term switching to perpetual updates cover page", async ({ page }) => {
    await page.getByRole("radio", { name: /In perpetuity/i }).click();
    await expect(page.getByText("In perpetuity")).toBeVisible();
  });

  test("filling Governing Law updates the cover page", async ({ page }) => {
    await page.getByPlaceholder("Delaware").fill("California");
    await expect(page.locator(".field-value").filter({ hasText: "California" }).first()).toBeVisible();
  });

  test("filling Jurisdiction updates the cover page", async ({ page }) => {
    await page.getByPlaceholder("New Castle, Delaware").fill("San Francisco, CA");
    await expect(page.locator(".field-value").filter({ hasText: "San Francisco, CA" }).first()).toBeVisible();
  });

  test("filling party 1 name appears in signature block", async ({ page }) => {
    await page.getByPlaceholder("Jane Smith").first().fill("Alice Smith");
    await expect(page.getByText("Alice Smith")).toBeVisible();
  });

  test("changing mndaTermYears to 3 shows '3 years from Effective Date'", async ({ page }) => {
    await page.getByRole("spinbutton").first().fill("3");
    await expect(page.getByText("3 years from Effective Date")).toBeVisible();
  });

  test("changing mndaTermYears to 1 shows singular 'year'", async ({ page }) => {
    await page.getByRole("spinbutton").first().fill("1");
    await expect(page.getByText("1 year from Effective Date")).toBeVisible();
    await expect(page.getByText("1 years from Effective Date")).not.toBeVisible();
  });
});

test.describe("NDA Creator — state preservation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mndaTermYears value is preserved when switching radio options", async ({ page }) => {
    await page.getByRole("spinbutton").first().fill("5");
    await page.getByRole("radio", { name: /Continues until terminated/i }).click();
    await page.getByRole("radio", { name: /Expires after a fixed number of years/i }).click();
    await expect(page.getByRole("spinbutton").first()).toHaveValue("5");
  });
});

test.describe("NDA Creator — print", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Download PDF button triggers window.print", async ({ page }) => {
    await page.addInitScript(() => {
      window.print = () => {
        (window as Window & { __printCalled__: boolean }).__printCalled__ = true;
      };
    });
    await page.getByRole("button", { name: /Download PDF/i }).click();
    expect(
      await page.evaluate(() => (window as Window & { __printCalled__: boolean }).__printCalled__ === true)
    ).toBe(true);
  });
});
