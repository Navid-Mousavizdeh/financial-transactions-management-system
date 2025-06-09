// TransactionTable.tsx
import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { Table, Input, Space } from "antd";
import dayjs from "dayjs";

type Props = {
  data: Transaction[];
};

export const TransactionTable: React.FC<Props> = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      { id: "id", accessorKey: "id", header: "Transaction ID" },
      { id: "status", accessorKey: "status", header: "Status" },
      { id: "amount", accessorKey: "amount", header: "Amount" },
      { id: "currency", accessorKey: "currency", header: "Currency" },
      {
        id: "timestamp",
        accessorKey: "timestamp",
        header: "Timestamp",
        cell: (info) =>
          dayjs(info.getValue<string>()).format("YYYY-MM-DD HH:mm:ss"),
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
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value ?? "")
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    },
  });

  const antColumns = table.getAllColumns().map((column) => ({
    title: column.columnDef.header as string,
    key: column.id,
    // No dataIndex here because nested keys with dots don't work natively in antd Table
    sorter: column.getCanSort()
      ? (a: any, b: any) => {
          const path = column.id.split(".");
          let valA = a;
          let valB = b;

          for (const key of path) {
            valA = valA?.[key];
            valB = valB?.[key];
          }

          if (typeof valA === "number" && typeof valB === "number") {
            return valA - valB;
          }

          return String(valA ?? "").localeCompare(String(valB ?? ""));
        }
      : undefined,
    render: (_: any, row: any) => {
      const path = column.id.split(".");
      console.log("path", path, row);
      let value = row;

      for (const key of path) {
        value = value?.[key];
      }

      return typeof value === "string" || typeof value === "number"
        ? value
        : JSON.stringify(value);
    },
  }));

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Input.Search
        placeholder="Search all fields"
        allowClear
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        style={{ maxWidth: 300 }}
      />

      <Table
        rowKey="id"
        columns={antColumns}
        dataSource={table.getRowModel().rows.map((row) => row.original)}
        pagination={{
          current: table.getState().pagination.pageIndex + 1,
          pageSize: table.getState().pagination.pageSize,
          total: table.getFilteredRowModel().rows.length, // total filtered rows count, not current page length
          onChange: (page, pageSize) => {
            table.setPageIndex(page - 1);
            table.setPageSize(pageSize);
          },
        }}
        scroll={{ x: "max-content" }}
      />
    </Space>
  );
};
