import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^react-markdown$": "<rootDir>/__mocks__/react-markdown.tsx",
    "^remark-gfm$": "<rootDir>/__mocks__/remark-gfm.ts",
    "^rehype-raw$": "<rootDir>/__mocks__/rehype-raw.ts",
  },
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/tests/",         // Playwright lives here
    "<rootDir>/__tests__/fixtures/", // shared test data, not test suites
  ],
};

export default createJestConfig(config);
