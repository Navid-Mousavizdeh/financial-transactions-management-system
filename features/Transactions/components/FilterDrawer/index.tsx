"use client";

import {
  Drawer,
  Space,
  DatePicker,
  Slider,
  Select,
  Button,
  Input,
  Typography,
  Spin,
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { RootState } from "@/store";
import { clearFilters, setTableState } from "@/store/slices/tableSlice";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface FilterDrawerProps {
  metaData: TransactionMetaData | undefined;
  isLoading: boolean;
  error: Error | null;
  visible: boolean;
  onClose: () => void;
}

const FilterDrawer = ({
  visible,
  onClose,
  error,
  isLoading,
  metaData,
}: FilterDrawerProps) => {
  const dispatch = useDispatch();
  const tableState = useSelector((state: RootState) => state.table);

  const updateFilters = (key: string, value: any) => {
    dispatch(
      setTableState({
        filters: { ...tableState.filters, [key]: value },
      })
    );
  };

  if (error) {
    console.error("Metadata fetch error:", error.message);
  }

  return (
    <Drawer
      title="Filters"
      placement="right"
      onClose={onClose}
      open={visible}
      width={300}
    >
      {isLoading ? (
        <Space
          direction="vertical"
          style={{ width: "100%", textAlign: "center" }}
        >
          <Spin />
          <Text>Loading filter options...</Text>
        </Space>
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <Text strong>Date Range</Text>
            <RangePicker
              value={
                tableState.filters.dateRange
                  ? [
                      dayjs(tableState.filters.dateRange[0]),
                      dayjs(tableState.filters.dateRange[1]),
                    ]
                  : null
              }
              onChange={(dates) =>
                updateFilters(
                  "dateRange",
                  dates && dates[0] && dates[1]
                    ? [dates[0].valueOf(), dates[1].valueOf()]
                    : null
                )
              }
              disabledDate={(current) =>
                metaData
                  ? current < dayjs(metaData.timestamp.min).startOf("day") ||
                    current > dayjs(metaData.timestamp.max).endOf("day")
                  : false
              }
              style={{ width: "100%", marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Amount Range</Text>
            <Slider
              range
              min={metaData?.amount.min ?? 0}
              max={metaData?.amount.max ?? 10000}
              value={tableState.filters.amountRange}
              onChange={(val) => updateFilters("amountRange", val)}
              style={{ marginTop: 8 }}
            />
          </div>
          <div>
            <Text strong>Status</Text>
            <Select
              mode="multiple"
              value={tableState.filters.status}
              onChange={(val) => updateFilters("status", val)}
              style={{ width: "100%", marginTop: 8 }}
              options={[
                { label: "Completed", value: "completed" },
                { label: "Pending", value: "pending" },
                { label: "Failed", value: "failed" },
              ]}
              placeholder="Select Status"
            />
          </div>
          <div>
            <Text strong>Merchant</Text>
            <Select
              showSearch
              value={tableState.filters.merchant}
              onChange={(val) => updateFilters("merchant", val)}
              style={{ width: "100%", marginTop: 8 }}
              options={
                metaData?.merchant_name.map((name) => ({
                  label: name,
                  value: name,
                })) ?? []
              }
              placeholder="Select Merchant"
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase()) ??
                false
              }
            />
          </div>
          <div>
            <Text strong>Payment Method</Text>
            <Select
              showSearch
              value={tableState.filters.paymentMethod}
              onChange={(val) => updateFilters("paymentMethod", val)}
              style={{ width: "100%", marginTop: 8 }}
              options={
                metaData?.payment_method.map((method) => ({
                  label: method,
                  value: method,
                })) ?? []
              }
              placeholder="Select Payment Method"
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase()) ??
                false
              }
            />
          </div>
          <Button
            type="primary"
            onClick={() => dispatch(clearFilters())}
            style={{ width: "100%", marginTop: 16 }}
          >
            Clear Filters
          </Button>
        </Space>
      )}
    </Drawer>
  );
};

export default FilterDrawer;
