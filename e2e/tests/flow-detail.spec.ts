import { test, expect } from "@playwright/test"
import { FlowDetailPage } from "../pages/FlowDetailPage"

test.describe("Flow Detail", () => {
  let detail: FlowDetailPage

  test.beforeEach(async ({ page }) => {
    detail = new FlowDetailPage(page)
    await detail.goto(1)
  })

  test("shows flow name", async () => {
    await detail.expectFlowNameVisible("Faktura behandling")
  })

  test("displays flow metrics", async () => {
    await detail.expectMetricsVisible()
  })

  test("displays run history table", async () => {
    await detail.expectHistoryTableVisible()
  })

  test("back button navigates to flows list", async ({ page }) => {
    await detail.clickBack()
    await expect(page).toHaveURL(/\/flows$/)
  })

  test("shows error state for nonexistent flow", async ({ page }) => {
    const errorDetail = new FlowDetailPage(page)
    await errorDetail.goto(999)
    await expect(errorDetail.errorMessage).toBeVisible()
  })
})
