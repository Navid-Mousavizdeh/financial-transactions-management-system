"use client";

import { JSX, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Tag } from "antd";
import dayjs from "dayjs";
import { RootState } from "@/store";
import { setTableState } from "@/store/slices/tableSlice";

const FilterChips = memo(() => {
  const dispatch = useDispatch();
  const tableState = useSelector((state: RootState) => state.table);
  const { filters } = tableState;
  const chips: JSX.Element[] = [];

  if (filters.dateRange) {
    chips.push(
      <Tag
        key="dateRange"
        closable
        onClose={() =>
          dispatch(setTableState({ filters: { ...filters, dateRange: null } }))
        }
        style={{ margin: 4 }}
      >
        Date: {dayjs(filters.dateRange[0]).format("YYYY-MM-DD")} -{" "}
        {dayjs(filters.dateRange[1]).format("YYYY-MM-DD")}
      </Tag>
    );
  }
  if (filters.amountRange[0] !== 0 || filters.amountRange[1] !== 10000) {
    chips.push(
      <Tag
        key="amountRange"
        closable
        onClose={() =>
          dispatch(
            setTableState({ filters: { ...filters, amountRange: [0, 10000] } })
          )
        }
        style={{ margin: 4 }}
      >
        Amount: {filters.amountRange[0]} - {filters.amountRange[1]}
      </Tag>
    );
  }
  filters.status.forEach((status) => {
    chips.push(
      <Tag
        key={status}
        closable
        onClose={() =>
          dispatch(
            setTableState({
              filters: {
                ...filters,
                status: filters.status.filter((s) => s !== status),
              },
            })
          )
        }
        style={{ margin: 4 }}
      >
        Status: {status}
      </Tag>
    );
  });
  if (filters.merchant) {
    chips.push(
      <Tag
        key="merchant"
        closable
        onClose={() =>
          dispatch(setTableState({ filters: { ...filters, merchant: "" } }))
        }
        style={{ margin: 4 }}
      >
        Merchant: {filters.merchant}
      </Tag>
    );
  }
  if (filters.paymentMethod) {
    chips.push(
      <Tag
        key="paymentMethod"
        closable
        onClose={() =>
          dispatch(
            setTableState({ filters: { ...filters, paymentMethod: "" } })
          )
        }
        style={{ margin: 4 }}
      >
        Payment Method: {filters.paymentMethod}
      </Tag>
    );
  }

  return <div style={{ marginBottom: 16 }}>{chips}</div>;
});

export default FilterChips;
