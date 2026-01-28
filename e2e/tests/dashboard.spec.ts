import { test, expect } from "@playwright/test"
import { DashboardPage } from "../pages/DashboardPage"

test.describe("Dashboard", () => {
  let dashboard: DashboardPage

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page)
    await dashboard.goto()
  })

  test("shows page title", async () => {
    await expect(dashboard.title).toBeVisible()
  })

  test("displays all 4 metric cards", async () => {
    await dashboard.expectMetricCardsVisible()
  })

  test("displays the chart section", async () => {
    await dashboard.expectChartVisible()
  })

  test("displays quick stats sections", async () => {
    await dashboard.expectQuickStatsVisible()
  })

  test("root path redirects to dashboard", async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/dashboard/)
  })
})
