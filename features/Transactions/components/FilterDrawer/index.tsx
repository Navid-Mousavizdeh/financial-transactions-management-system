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
} from "antd";
import { useSelector, useDispatch } from "react-redux";
import dayjs from "dayjs";
import { RootState } from "@/store";
import { clearFilters, setTableState } from "@/store/slices/tableSlice";

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface FilterDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const FilterDrawer = ({ visible, onClose }: FilterDrawerProps) => {
  const dispatch = useDispatch();
  const tableState = useSelector((state: RootState) => state.table);

  const updateFilters = (key: string, value: any) => {
    dispatch(
      setTableState({
        filters: { ...tableState.filters, [key]: value },
      })
    );
  };

  return (
    <Drawer
      title="Filters"
      placement="right"
      onClose={onClose}
      open={visible}
      width={300}
    >
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
            style={{ width: "100%", marginTop: 8 }}
          />
        </div>
        <div>
          <Text strong>Amount Range</Text>
          <Slider
            range
            min={0}
            max={10000}
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
          <Input
            placeholder="Merchant"
            value={tableState.filters.merchant}
            onChange={(e) => updateFilters("merchant", e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
        <div>
          <Text strong>Payment Method</Text>
          <Input
            placeholder="Payment Method"
            value={tableState.filters.paymentMethod}
            onChange={(e) => updateFilters("paymentMethod", e.target.value)}
            style={{ marginTop: 8 }}
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
    </Drawer>
  );
};

export default FilterDrawer;
