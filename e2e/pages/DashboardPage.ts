import { type Page, type Locator, expect } from "@playwright/test"
import { BasePage } from "./BasePage"

export class DashboardPage extends BasePage {
  readonly title: Locator
  readonly flowsTodayCard: Locator
  readonly successRateCard: Locator
  readonly activeRobotsCard: Locator
  readonly errorsTodayCard: Locator
  readonly chart: Locator
  readonly mostActiveFlows: Locator
  readonly recentErrors: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByRole("heading", { name: "Dashboard" })
    this.flowsTodayCard = page.getByText("Kørte flows i dag")
    this.successRateCard = page.getByText("Success rate").first()
    this.activeRobotsCard = page.getByText("Aktive robotter")
    this.errorsTodayCard = page.getByText("Fejl i dag")
    this.chart = page.getByText("Flow kørsler (sidste 7 dage)")
    this.mostActiveFlows = page.getByText("Mest aktive flows")
    this.recentErrors = page.getByText("Seneste fejl")
  }

  async goto() {
    await this.navigateTo("/dashboard")
  }

  async expectMetricCardsVisible() {
    await expect(this.flowsTodayCard).toBeVisible()
    await expect(this.successRateCard).toBeVisible()
    await expect(this.activeRobotsCard).toBeVisible()
    await expect(this.errorsTodayCard).toBeVisible()
  }

  async expectChartVisible() {
    await expect(this.chart).toBeVisible()
  }

  async expectQuickStatsVisible() {
    await expect(this.mostActiveFlows).toBeVisible()
    await expect(this.recentErrors).toBeVisible()
  }
}
