import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "api",
      testMatch: "api.spec.ts",
      use: { baseURL: "http://localhost:8080" },
    },
  ],
  webServer: {
    command: "cd ../1.Tutorial/1.SimpleServer/js && npx tsx server.ts",
    port: 8080,
    reuseExistingServer: true,
    timeout: 10_000,
  },
});
