import { test, expect } from "@playwright/test"
import { BasePage } from "../pages/BasePage"

test.describe("Navigation", () => {
  test("sidebar links navigate correctly", async ({ page }) => {
    const base = new BasePage(page)
    await base.navigateTo("/dashboard")

    // Navigate to Flows
    await base.flowsLink.click()
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/flows$/)

    // Navigate back to Dashboard
    await base.dashboardLink.click()
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("unknown route redirects to dashboard", async ({ page }) => {
    await page.goto("/nonexistent-page")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test("active sidebar link is highlighted", async ({ page }) => {
    const base = new BasePage(page)
    await base.navigateTo("/dashboard")

    // The active link should have the blue background class
    const dashboardLink = base.dashboardLink
    await expect(dashboardLink).toHaveClass(/bg-blue-600/)
  })
})
