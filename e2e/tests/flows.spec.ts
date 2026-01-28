import { test, expect } from "@playwright/test"
import { FlowsPage } from "../pages/FlowsPage"

test.describe("Flows", () => {
  let flows: FlowsPage

  test.beforeEach(async ({ page }) => {
    flows = new FlowsPage(page)
    await flows.goto()
  })

  test("shows page title", async () => {
    await expect(flows.title).toBeVisible()
  })

  test("displays table with 5 flow rows", async () => {
    await flows.expectTableVisible()
    await flows.expectRowCount(5)
  })

  test("search filters table rows", async ({ page }) => {
    await flows.searchFor("Faktura")
    // Wait for client-side filter to apply
    await page.waitForTimeout(300)
    await flows.expectRowCount(1)
  })

  test("reset button clears search", async ({ page }) => {
    await flows.searchFor("Faktura")
    await page.waitForTimeout(300)
    await flows.expectRowCount(1)
    await flows.resetButton.click()
    await page.waitForTimeout(300)
    await flows.expectRowCount(5)
  })

  test("clicking row navigates to flow detail", async ({ page }) => {
    await flows.clickRow(0)
    await page.waitForLoadState("networkidle")
    await expect(page).toHaveURL(/\/flows\/\d+/)
  })
})
