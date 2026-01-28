import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],

  webServer: [
    {
      command: "cd backend && uvicorn main:app --port 8000",
      port: 8000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "cd frontend && npm run dev",
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
