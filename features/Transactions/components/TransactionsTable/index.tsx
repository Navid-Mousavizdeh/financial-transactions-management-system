"use client";

import { useMemo, useState, useEffect, useCallback, memo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Table,
  Input,
  Space,
  Button,
  message,
  Typography,
  Spin,
  Badge,
} from "antd";
import {
  DeleteOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import { RootState } from "@/store";
import { generateGetParams } from "@/utils";
import { setTableState } from "@/store/slices/tableSlice";
import FilterChips from "../FilterChips";
import { useRouter } from "next/navigation";

const { Text } = Typography;

const FilterDrawer = dynamic(() => import("../FilterDrawer"), { ssr: false });

const TransactionTable = memo(() => {
  const dispatch = useDispatch();
  const router = useRouter();
  const tableState = useSelector((state: RootState) => state.table);
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [maxPage, setMaxPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const filterArray: {
      field: string;
      value: string | number | string[] | { min?: number; max?: number };
    }[] = [];

    if (
      tableState.filters.dateRange?.[0] &&
      tableState.filters.dateRange?.[1]
    ) {
      filterArray.push({
        field: "timestamp",
        value: {
          min: tableState.filters.dateRange[0],
          max: tableState.filters.dateRange[1],
        },
      });
    }
    if (
      tableState.filters.amountRange?.[0] !== 0 ||
      tableState.filters.amountRange?.[1] !== 10000
    ) {
      filterArray.push({
        field: "amount",
        value: {
          min: tableState.filters.amountRange[0],
          max: tableState.filters.amountRange[1],
        },
      });
    }
    if (tableState.filters.status.length) {
      filterArray.push({ field: "status", value: tableState.filters.status });
    }
    if (tableState.filters.merchant) {
      filterArray.push({
        field: "merchant.name",
        value: tableState.filters.merchant,
      });
    }
    if (tableState.filters.paymentMethod) {
      filterArray.push({
        field: "payment_method.type",
        value: tableState.filters.paymentMethod,
      });
    }

    const params = generateGetParams({
      sort: tableState.sort,
      filter: filterArray,
      search: tableState.filters.search || undefined,
      page: tableState.page,
      size: tableState.size,
    });

    try {
      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to fetch transactions");
      }
      const { data, total, maxPage } = await response.json();
      setData(data);
      setTotal(total);
      setMaxPage(maxPage);
    } catch (error) {
      message.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [tableState]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo(
    () => [
      { id: "id", accessorKey: "id", header: "Transaction ID" },
      { id: "status", accessorKey: "status", header: "Status" },
      { id: "amount", accessorKey: "amount", header: "Amount" },
      { id: "currency", accessorKey: "currency", header: "Currency" },
      {
        id: "timestamp",
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: ({ getValue }: any) =>
          dayjs(getValue()).format("YYYY-MM-DD HH:mm:ss"),
      },
      { id: "description", accessorKey: "description", header: "Description" },
      {
        id: "merchant.name",
        accessorKey: "merchant.name",
        header: "Merchant Name",
      },
      { id: "merchant.id", accessorKey: "merchant.id", header: "Merchant ID" },
      {
        id: "payment_method.type",
        accessorKey: "payment_method.type",
        header: "Payment Type",
      },
      {
        id: "payment_method.brand",
        accessorKey: "payment_method.brand",
        header: "Card Brand",
      },
      {
        id: "payment_method.last4",
        accessorKey: "payment_method.last4",
        header: "Last 4",
      },
      { id: "sender.name", accessorKey: "sender.name", header: "Sender Name" },
      {
        id: "sender.account_id",
        accessorKey: "sender.account_id",
        header: "Sender Account",
      },
      {
        id: "receiver.name",
        accessorKey: "receiver.name",
        header: "Receiver Name",
      },
      {
        id: "receiver.account_id",
        accessorKey: "receiver.account_id",
        header: "Receiver Account",
      },
      {
        id: "fees.processing_fee",
        accessorKey: "fees.processing_fee",
        header: "Processing Fee",
      },
      {
        id: "fees.currency",
        accessorKey: "fees.currency",
        header: "Fee Currency",
      },
      {
        id: "metadata.order_id",
        accessorKey: "metadata.order_id",
        header: "Order ID",
      },
      {
        id: "metadata.customer_id",
        accessorKey: "metadata.customer_id",
        header: "Customer ID",
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (updater) => {
      const newSort =
        typeof updater === "function"
          ? updater(
              tableState.sort.map((s) => ({
                id: s.field,
                desc: s.order === "desc",
              }))
            )
          : updater;
      dispatch(
        setTableState({
          sort: newSort.map((s) => ({
            field: s.id,
            order: s.desc ? "desc" : "asc",
          })),
        })
      );
    },
    state: {
      sorting: tableState.sort.map((s) => ({
        id: s.field,
        desc: s.order === "desc",
      })),
      pagination: { pageIndex: tableState.page - 1, pageSize: tableState.size },
    },
  });

  const tableContainerRef = useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Approximate row height
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const tableHeight = useMemo(() => {
    const visibleRowsHeight = (virtualRows.length + 1) * 77 + 48; // Estimate based on row height
    const minHeight = 400;
    return Math.max(visibleRowsHeight, minHeight);
  }, [virtualRows.length]);

  const handleDeleteSelected = () => {
    message.success(
      `Deleted ${selectedRowKeys.length} item${
        selectedRowKeys.length > 1 ? "s" : ""
      }`
    );
    setSelectedRowKeys([]);
  };

  return (
    <Space direction="vertical" style={{ width: "100%", height: "100%" }}>
      <Space style={{ marginBottom: 8, width: "100%" }}>
        <Input.Search
          placeholder="Search transactions"
          value={tableState.filters.search}
          onChange={(e) =>
            dispatch(
              setTableState({
                filters: { ...tableState.filters, search: e.target.value },
              })
            )
          }
          style={{ width: 200 }}
          allowClear
        />
        <Badge
          count={Object.values(
            tableState.filters.amountRange[0] === 0 &&
              tableState.filters.amountRange[1] === 10000
              ? { ...tableState.filters, amountRange: null }
              : tableState.filters
          ).reduce((pre, cur) => {
            console.log("  tableState.filters", tableState.filters);
            return (
              pre + (Array.isArray(cur) ? (cur.length ? 1 : 0) : cur ? 1 : 0)
            );
          }, 0)}
        >
          <Button
            icon={<FilterOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            Filters
          </Button>
        </Badge>
        <Button
          variant="solid"
          color="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            router.push("/transaction");
          }}
        >
          Add
        </Button>
        {selectedRowKeys.length > 0 && (
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDeleteSelected}
          >
            Delete{" "}
            {selectedRowKeys.length > 1
              ? `${selectedRowKeys.length} Selected Items`
              : "Selected Item"}
          </Button>
        )}
      </Space>
      <FilterChips />
      <FilterDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
      <div
        ref={tableContainerRef}
        style={{
          overflow: "auto",
          justifyContent: "center",
          width: "100%",
          display: "flex",
          minHeight: 200,
        }}
      >
        {!rows?.length && loading ? (
          <Spin />
        ) : (
          <Table
            rowKey="id"
            columns={table.getAllColumns().map((col) => ({
              title: col.columnDef.header as string,

              key: col.id,
              render: (_, record: Transaction) => {
                const keys = col.id.split(".");
                let value: any = record;
                for (const k of keys) {
                  value = value?.[k];
                }
                return typeof value === "string" || typeof value === "number"
                  ? value
                  : JSON.stringify(value);
              },
              sorter: { multiple: 1 },
              sortOrder: table.getState().sorting.find((s) => s.id === col.id)
                ?.desc
                ? "descend"
                : table.getState().sorting.find((s) => s.id === col.id)
                ? "ascend"
                : null,
              fixed: col.id === "id" ? "left" : undefined,
              width: col.id === "id" ? 120 : col.id === "timestamp" ? 180 : 150,
            }))}
            dataSource={virtualRows.map((vr) => rows[vr.index].original)}
            loading={loading}
            scroll={{ x: "max-content" }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys(keys),
            }}
            pagination={{
              current: tableState.page,
              pageSize: tableState.size,
              total,
              showSizeChanger: true,
              showTotal: (total: number, range) => {
                return (
                  <Text disabled style={{ marginTop: 4 }}>{`${range.join(
                    " to "
                  )} of ${total} items`}</Text>
                );
              },
              pageSizeOptions: [10, 20, 50, 100],
              onChange: (newPage, newSize) =>
                dispatch(setTableState({ page: newPage, size: newSize })),
              disabled: maxPage === 0,
            }}
            onChange={(_, __, sorter) => {
              const sorterArray = Array.isArray(sorter) ? sorter : [sorter];
              const sort = sorterArray
                .filter((s) => s.order)
                .map((s) => ({
                  field: s.columnKey as string,
                  order: s.order === "descend" ? "desc" : "asc",
                })) as { field: string; order: "asc" | "desc" }[];
              dispatch(setTableState({ sort }));
            }}
            style={{ height: tableHeight }}
          />
        )}
      </div>
    </Space>
  );
});

export default TransactionTable;
