import { getTransactions } from "@/features/utils"; // Correct import
import { clearFilters } from "@/store/slices/tableSlice";
import { generateGetParams } from "@/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransactionTable } from ".";
import { transactionsQueryKeys } from "../../constants";

// Mock dependencies
vi.mock("react-redux", () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

vi.mock("antd", () => ({
  message: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/hooks", () => ({
  useDebounce: vi.fn((value) => value),
}));

vi.mock("@/utils", () => ({
  generateGetParams: vi.fn(), // Only mock generateGetParams
}));

vi.mock("@/features/utils", () => ({
  getTransactions: vi.fn(),
  deleteTransactions: vi.fn(),
}));

vi.mock("@/store/slices/tableSlice", () => ({
  clearFilters: vi.fn(),
  setTableState: vi.fn(),
}));

describe("useTransactionTable", () => {
  const mockDispatch = vi.fn();
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };
  const mockData = {
    transactions: [{ id: 1, amount: 100, status: "completed" }],
    total: 10,
    maxPage: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useDispatch as any).mockReturnValue(mockDispatch);
    (useQueryClient as any).mockReturnValue(mockQueryClient);
    (useSelector as any).mockReturnValue({
      sort: {},
      filters: {
        search: "",
        dateRange: [],
        amountRange: [0, 10000],
        status: [],
        merchant: "",
        paymentMethod: "",
      },
      page: 1,
      size: 10,
    });
    (useQuery as any).mockReturnValue({
      data: mockData,
      isLoading: false,
      isFetching: false,
      error: null,
    });
    (useMutation as any).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    (generateGetParams as any).mockReturnValue(new URLSearchParams());
    (getTransactions as any).mockResolvedValue(mockData); // This should now work
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useTransactionTable());

    expect(result.current.search).toBe("");
    expect(result.current.selectedRowKeys).toEqual([]);
    expect(result.current.drawerVisible).toBe(false);
    expect(result.current.total).toBe(0);
    expect(result.current.maxPage).toBe(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockData);
  });

  it("should update search state", async () => {
    const { result } = renderHook(() => useTransactionTable());

    act(() => {
      result.current.setSearch("test");
    });

    await waitFor(() => {
      expect(result.current.search).toBe("test");
    });
  });

  it("should not call delete mutation if no rows are selected", () => {
    const mockMutate = vi.fn();
    (useMutation as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    const { result } = renderHook(() => useTransactionTable());

    act(() => {
      result.current.handleDeleteSelected();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
