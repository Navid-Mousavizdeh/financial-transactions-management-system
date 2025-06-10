import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TableState {
  page: number;
  size: number;
  sort: { field: string; order: "asc" | "desc" }[];
  filters: {
    dateRange: number[] | null;
    amountRange: [number, number];
    status: string[];
    merchant: string;
    paymentMethod: string;
    search: string;
  };
}

const initialState: TableState = {
  page: 1,
  size: 10,
  sort: [],
  filters: {
    dateRange: null,
    amountRange: [0, 10000],
    status: [],
    merchant: "",
    paymentMethod: "",
    search: "",
  },
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTableState: (state, action: PayloadAction<Partial<TableState>>) => {
      return { ...state, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        dateRange: null,
        amountRange: [0, 10000],
        status: [],
        merchant: "",
        paymentMethod: "",
        search: "",
      };
    },
  },
});

export const { setTableState, clearFilters } = tableSlice.actions;
export default tableSlice.reducer;
