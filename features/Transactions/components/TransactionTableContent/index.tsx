"use client";

import { useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Table, Spin, Typography } from "antd";
import dayjs from "dayjs";
import { RootState } from "@/store";
import { setTableState } from "@/store/slices/tableSlice";

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
    estimateSize: () => 40,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const tableHeight = useMemo(() => {
    const visibleRowsHeight = (virtualRows.length + 1) * 77 + 48;
    const minHeight = 400;
    return Math.max(visibleRowsHeight, minHeight);
  }, [virtualRows.length]);

  return (
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
          sortOrder: table.getState().sorting.find((s) => s.id === col.id)?.desc
            ? "descend"
            : table.getState().sorting.find((s) => s.id === col.id)
            ? "ascend"
            : null,
          fixed: col.id === "id" ? "left" : undefined,
          width: col.id === "id" ? 120 : col.id === "timestamp" ? 180 : 150,
        }))}
        dataSource={virtualRows.map((vr) => rows[vr.index].original)}
        loading={loading}
        locale={{
          emptyText: loading ? "Loading" : undefined,
        }}
        scroll={{ x: "max-content" }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          current: tableState.page,
          pageSize: tableState.size,
          total,
          showSizeChanger: true,
          showTotal: (total: number, range) => (
            <Text disabled style={{ marginTop: 4 }}>
              {`${range.join(" to ")} of ${total} items`}
            </Text>
          ),
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
    </div>
  );
};

export default TransactionTableContent;
