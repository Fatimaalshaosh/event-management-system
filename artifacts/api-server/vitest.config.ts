import { defineConfig } from "vitest/config";
import { deriveTestDatabaseUrl } from "./src/test/testDb";

const rawDatabaseUrl = process.env.DATABASE_URL;
const testDatabaseUrl = rawDatabaseUrl
  ? deriveTestDatabaseUrl(rawDatabaseUrl)
  : undefined;

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.integration.test.ts"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["src/**/*.integration.test.ts"],
          globalSetup: ["./src/test/globalSetup.ts"],
          fileParallelism: false,
          env: testDatabaseUrl ? { DATABASE_URL: testDatabaseUrl } : {},
        },
      },
    ],
  },
});
