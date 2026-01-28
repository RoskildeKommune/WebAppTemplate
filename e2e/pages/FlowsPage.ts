import { type Page, type Locator, expect } from "@playwright/test"
import { BasePage } from "./BasePage"

export class FlowsPage extends BasePage {
  readonly title: Locator
  readonly searchInput: Locator
  readonly statusFilter: Locator
  readonly resetButton: Locator
  readonly table: Locator
  readonly tableRows: Locator
  readonly noResultsMessage: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByRole("heading", { name: "Flows" })
    this.searchInput = page.getByPlaceholder("Søg efter flow eller robot...")
    this.statusFilter = page.locator("select, [role='combobox']").first()
    this.resetButton = page.getByRole("button", { name: "Nulstil" })
    this.table = page.locator("table")
    this.tableRows = page.locator("tbody tr")
    this.noResultsMessage = page.getByText("Ingen flows matcher din søgning")
  }

  async goto() {
    await this.navigateTo("/flows")
  }

  async expectTableVisible() {
    await expect(this.table).toBeVisible()
  }

  async expectRowCount(count: number) {
    await expect(this.tableRows).toHaveCount(count)
  }

  async searchFor(term: string) {
    await this.searchInput.fill(term)
  }

  async clickRow(index: number) {
    await this.tableRows.nth(index).click()
  }
}
