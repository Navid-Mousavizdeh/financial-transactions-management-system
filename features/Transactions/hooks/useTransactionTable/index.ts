import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { RootState } from "@/store";
import { clearFilters, setTableState } from "@/store/slices/tableSlice";
import { generateGetParams } from "@/utils";
import { useDebounce } from "@/hooks";
import { deleteTransactions, getTransactions } from "../../../utils";
import { TransactionTableData } from "../../types";
import { transactionsQueryKeys } from "../../constants";

export const useTransactionTable = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const tableState = useSelector((state: RootState) => state.table);
  const [search, setSearch] = useState(tableState.filters.search || "");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [pagination, setPagination] = useState<{
    total: number;
    maxPage: number;
  }>({
    total: 0,
    maxPage: 1,
  });

  // Debounce search, filters, and sort
  const debouncedSearch = useDebounce(search, 500);
  const debouncedTableState = useDebounce(
    {
      sort: tableState.sort,
      filters: tableState.filters,
      page: tableState.page,
      size: tableState.size,
    },
    500
  );

  // Generate query parameters
  const queryParams = useMemo(() => {
    const filterArray: {
      field: string;
      value: string | number | string[] | { min?: number; max?: number };
    }[] = [];

    if (
      debouncedTableState.filters.dateRange?.[0] &&
      debouncedTableState.filters.dateRange?.[1]
    ) {
      filterArray.push({
        field: "timestamp",
        value: {
          min: debouncedTableState.filters.dateRange[0],
          max: debouncedTableState.filters.dateRange[1],
        },
      });
    }
    if (
      debouncedTableState.filters.amountRange?.[0] !== 0 ||
      debouncedTableState.filters.amountRange?.[1] !== 10000
    ) {
      filterArray.push({
        field: "amount",
        value: {
          min: debouncedTableState.filters.amountRange[0],
          max: debouncedTableState.filters.amountRange[1],
        },
      });
    }
    if (debouncedTableState.filters.status.length) {
      filterArray.push({
        field: "status",
        value: debouncedTableState.filters.status,
      });
    }
    if (debouncedTableState.filters.merchant) {
      filterArray.push({
        field: "merchant.name",
        value: debouncedTableState.filters.merchant,
      });
    }
    if (debouncedTableState.filters.paymentMethod) {
      filterArray.push({
        field: "payment_method.type",
        value: debouncedTableState.filters.paymentMethod,
      });
    }

    // Calculate filter count for badge
    const filterCount = Object.values(
      debouncedTableState.filters.amountRange[0] === 0 &&
        debouncedTableState.filters.amountRange[1] === 10000
        ? { ...debouncedTableState.filters, amountRange: null }
        : debouncedTableState.filters
    ).reduce((pre, cur) => {
      return pre + (Array.isArray(cur) ? (cur.length ? 1 : 0) : cur ? 1 : 0);
    }, 0);

    return {
      params: generateGetParams({
        sort: debouncedTableState.sort,
        filter: filterArray,
        search: debouncedSearch || undefined,
        page: debouncedTableState.page,
        size: debouncedTableState.size,
      }),
      filterCount,
    };
  }, [debouncedTableState, debouncedSearch]);

  // Fetch data using React Query
  const { data, isLoading, isFetching, error } = useQuery<
    TransactionTableData,
    Error
  >({
    queryKey: [
      transactionsQueryKeys.transactions,
      queryParams.params.toString(),
    ],
    queryFn: async () => {
      const response = await getTransactions(queryParams.params, setPagination);
      return {
        ...response,
        filterCount: queryParams.filterCount,
      };
    },

    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

  // Delete mutation
  const { mutate: deleteSelected, isPending: isDeleting } = useMutation({
    mutationFn: (ids: React.Key[]) => deleteTransactions(ids),
    onSuccess: () => {
      message.success(
        `Deleted ${selectedRowKeys.length} item${
          selectedRowKeys.length > 1 ? "s" : ""
        }`
      );
      setSelectedRowKeys([]);
      dispatch(clearFilters());
      queryClient.invalidateQueries({
        queryKey: [transactionsQueryKeys.transactions],
      });
    },
    onError: (err: Error) => {
      message.error(err.message || "Failed to delete transactions");
    },
  });

  // Handle delete
  const handleDeleteSelected = () => {
    if (selectedRowKeys.length > 0) {
      deleteSelected(selectedRowKeys);
    }
  };

  return {
    search,
    setSearch,
    selectedRowKeys,
    setSelectedRowKeys,
    drawerVisible,
    setDrawerVisible,
    data,
    isLoading: isLoading || isFetching,
    error,
    total: pagination.total ?? 0,
    maxPage: pagination.maxPage ?? 1,
    handleDeleteSelected,
    isDeleting,
  };
};
