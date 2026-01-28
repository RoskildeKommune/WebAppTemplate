/**
 * TEMPLATE: E2E test for a new page.
 *
 * Copy this file and replace:
 * - "PageName" with the actual page name
 * - "/page-path" with the actual route
 * - "Page Title" with the expected heading text
 * - Add page-specific assertions
 *
 * Naming: {page-name}.spec.ts  (e.g., robots.spec.ts)
 * Location: e2e/tests/
 *
 * Consider creating a Page Object in e2e/pages/ if the page
 * has multiple interactive elements or is tested extensively.
 */

import { test, expect } from "@playwright/test"
import { BasePage } from "../pages/BasePage"

test.describe("PageName", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/page-path")
    await page.waitForLoadState("networkidle")
  })

  test("shows page title", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Page Title" })).toBeVisible()
  })

  test("loads API data", async ({ page }) => {
    // Wait for the API response to load
    const base = new BasePage(page)
    await base.waitForApiResponse("/api/example")

    // Assert content that depends on API data
    // await expect(page.getByText("Expected content")).toBeVisible()
  })

  test("displays main content", async ({ page }) => {
    // Add assertions for the main content area
    // await expect(page.locator("table")).toBeVisible()
  })
})
