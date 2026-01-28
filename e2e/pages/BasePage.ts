import { type Page, type Locator, expect } from "@playwright/test"

export class BasePage {
  readonly page: Page
  readonly sidebar: Locator
  readonly header: Locator
  readonly dashboardLink: Locator
  readonly flowsLink: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.locator("div.w-64")
    this.header = page.locator("header")
    this.dashboardLink = page.getByRole("link", { name: "Dashboard" })
    this.flowsLink = page.getByRole("link", { name: "Flows" })
  }

  async navigateTo(path: string) {
    await this.page.goto(path)
    await this.page.waitForLoadState("networkidle")
  }

  async waitForApiResponse(urlPattern: string) {
    return this.page.waitForResponse((response) =>
      response.url().includes(urlPattern)
    )
  }

  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible()
    await expect(this.page.getByText("RPA Dashboard")).toBeVisible()
  }
}
