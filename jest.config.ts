import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts", // entry point pomijamy
  ],
  coverageDirectory: "coverage",
  verbose: true, // szczegółowe logi w terminalu
  clearMocks: true, // czyści mocki między testami automatycznie
};

export default config;
