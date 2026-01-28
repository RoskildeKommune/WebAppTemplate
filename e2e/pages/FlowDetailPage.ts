import { type Page, type Locator, expect } from "@playwright/test"
import { BasePage } from "./BasePage"

export class FlowDetailPage extends BasePage {
  readonly backButton: Locator
  readonly flowName: Locator
  readonly metricsGrid: Locator
  readonly historyTable: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    this.backButton = page.getByRole("button", { name: "← Tilbage" })
    this.flowName = page.locator("h3, [class*='Title']").first()
    this.metricsGrid = page.getByText("Kørsler (24 timer)")
    this.historyTable = page.getByText("Seneste kørsler")
    this.errorMessage = page.getByText("Flow ikke fundet")
  }

  async goto(id: number) {
    await this.navigateTo(`/flows/${id}`)
  }

  async expectFlowNameVisible(name: string) {
    await expect(this.page.getByText(name, { exact: false })).toBeVisible()
  }

  async expectMetricsVisible() {
    await expect(this.metricsGrid).toBeVisible()
    await expect(this.page.getByText("Success rate").first()).toBeVisible()
  }

  async expectHistoryTableVisible() {
    await expect(this.historyTable).toBeVisible()
  }

  async clickBack() {
    await this.backButton.click()
    await this.page.waitForLoadState("networkidle")
  }
}
