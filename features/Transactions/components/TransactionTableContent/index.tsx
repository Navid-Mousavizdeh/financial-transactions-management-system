"use client";

import { useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, Typography, Skeleton } from "antd";
import dayjs from "dayjs";
import { RootState } from "@/store";
import { setTableState } from "@/store/slices/tableSlice";
import { useRouter } from "next/navigation";

const { Text } = Typography;

interface TransactionTableContentProps {
  data: Transaction[];
  total: number;
  maxPage: number;
  loading: boolean;
  selectedRowKeys: React.Key[];
  setSelectedRowKeys: (keys: React.Key[]) => void;
}

const TransactionTableContent = ({
  data,
  total,
  maxPage,
  loading,
  selectedRowKeys,
  setSelectedRowKeys,
}: TransactionTableContentProps) => {
  const dispatch = useDispatch();
  const tableState = useSelector((state: RootState) => state.table);
  const router = useRouter();

  // Store a copy of the current data in a ref
  const currentDataRef = useRef<Transaction[]>(data);

  // Update the ref whenever new data is received (not during loading)
  useEffect(() => {
    if (!loading) {
      currentDataRef.current = data;
    }
  }, [data, loading]);

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
          getValue() ? dayjs(getValue()).format("YYYY-MM-DD HH:mm:ss") : "-",
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

  // Use current data during loading, ensure exactly tableState.size rows
  const displayData = useMemo(() => {
    const sourceData = loading ? currentDataRef.current : data;
    const isLastPage = tableState.page === Math.ceil(total / tableState.size);
    const expectedRows = isLastPage
      ? Math.min(total % tableState.size || tableState.size, tableState.size)
      : tableState.size;

    if (sourceData.length === expectedRows) return sourceData;
    if (sourceData.length > expectedRows) {
      return sourceData.slice(0, expectedRows);
    }
    return [
      ...sourceData,
      ...Array.from(
        { length: expectedRows - sourceData.length },
        (_, index) => ({
          id: `empty-${index}`,
          status: "pending" as "pending" | "completed" | "failed",
          amount: 0,
          currency: "",
          timestamp: "",
          description: "",
          merchant: { name: "", id: "" },
          payment_method: { type: "", brand: "", last4: "" },
          sender: { name: "", account_id: "" },
          receiver: { name: "", account_id: "" },
          fees: { processing_fee: 0, currency: "" },
          metadata: { order_id: "", customer_id: "" },
        })
      ),
    ];
  }, [loading, data, tableState.size, tableState.page, total]);

  const table = useReactTable({
    data: displayData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onSortingChange: (updater) => {
      if (loading) return;
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
    estimateSize: () => 55,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const tableHeight = useMemo(() => {
    const visibleRowsHeight = virtualRows.length * 55;
    const minHeight = 400;
    return Math.max(visibleRowsHeight + 150, minHeight);
  }, [virtualRows.length]);

  // Calculate pagination range for display
  const paginationRange = useMemo(() => {
    const start = (tableState.page - 1) * tableState.size + 1;
    const end = Math.min(start + tableState.size - 1, total);
    return [start, end];
  }, [tableState.page, tableState.size, total]);

  return (
    <div
      ref={tableContainerRef}
      style={{
        overflow: "auto",
        justifyContent: "center",
        width: "100%",
        display: "flex",
        flexGrow: 1,
        minHeight: 200,
      }}
    >
      <Table<Transaction>
        rowKey="id"
        columns={table.getAllColumns().map((col) => ({
          title: col.columnDef.header as string,
          key: col.id,
          render: (_, record: Transaction) => {
            if (loading) {
              return (
                <Skeleton.Input
                  active
                  size="small"
                  style={{ width: 100, height: "18px" }}
                />
              );
            }
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
          sortOrder: table.getState().sorting.find((s) => s.id === col.id)?.desc
            ? "descend"
            : table.getState().sorting.find((s) => s.id === col.id)
            ? "ascend"
            : null,
          fixed: col.id === "id" ? "left" : undefined,
        }))}
        dataSource={virtualRows.map((vr) => rows[vr.index].original)}
        scroll={{ x: "max-content" }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: () => ({
            disabled: loading,
          }),
        }}
        pagination={{
          current: tableState.page,
          pageSize: tableState.size,
          total: total,
          showSizeChanger: true,
          showTotal: (total: number) => (
            <Text disabled={loading} style={{ marginTop: 4 }}>
              {loading
                ? `Loading ${paginationRange.join(" to ")} of ${total} items`
                : `${paginationRange.join(" to ")} of ${total} items`}
            </Text>
          ),
          pageSizeOptions: [10, 20, 50, 100],
          onChange: (newPage, newSize) => {
            if (loading) return;
            dispatch(setTableState({ page: newPage, size: newSize }));
          },
          disabled: maxPage === 0 || loading,
          showLessItems: true,
          hideOnSinglePage: false,
          position: ["bottomCenter"],
        }}
        onRow={(record) => ({
          onClick: () => {
            if (!loading) {
              router.push(`/transaction/${record.id}`);
            }
          },
          style: loading ? { cursor: "not-allowed" } : undefined,
        })}
        onChange={(_, __, sorter) => {
          if (loading) return;
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
    </div>
  );
};

export default TransactionTableContent;
