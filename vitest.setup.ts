// vitest.setup.ts
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom";

vi.mock("antd", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});
