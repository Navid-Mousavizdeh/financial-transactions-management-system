"use client";

import { Input, Space } from "antd";
import { useRouter } from "next/navigation";
import { useTransactionMetaData } from "../../hooks/useTransactionMetaData";
import { useTransactionTable } from "../../hooks/useTransactionTable";
import { AddButton, DeleteButton, FilterButton } from "../actions";
import FilterChips from "../FilterChips";
import FilterDrawer from "../FilterDrawer";
import TransactionTableContent from "../TransactionTableContent";

const TransactionTable = () => {
  const router = useRouter();
  const {
    search,
    setSearch,
    selectedRowKeys,
    setSelectedRowKeys,
    drawerVisible,
    setDrawerVisible,
    data,
    isLoading,
    total,
    maxPage,
    handleDeleteSelected,
    isDeleting,
    error,
  } = useTransactionTable();
  const {
    data: metaData,
    isLoading: isLoadingMetaData,
    error: errorMetaData,
  } = useTransactionMetaData();

  if (error) {
    console.error("Transaction fetch error:", error.message);
  }

  return (
    <Space direction="vertical" style={{ width: "100%", height: "100%" }}>
      <Space style={{ marginBottom: 8, width: "100%" }}>
        <Input.Search
          placeholder="Search transactions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <FilterButton
          filterCount={data?.filterCount}
          isLoadingMetaData={isLoadingMetaData}
          setDrawerVisible={setDrawerVisible}
        />
        <AddButton />
        <DeleteButton
          handleDeleteSelected={handleDeleteSelected}
          isDeleting={isDeleting}
          numSelectedRowKeys={selectedRowKeys.length}
        />
      </Space>
      <FilterChips />
      <FilterDrawer
        metaData={metaData}
        isLoading={isLoadingMetaData}
        error={errorMetaData}
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      />
      <TransactionTableContent
        data={data?.transactions || []}
        total={total}
        maxPage={maxPage}
        loading={isLoading}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
      />
    </Space>
  );
};

export default TransactionTable;
