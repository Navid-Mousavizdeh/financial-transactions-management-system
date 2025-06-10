import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./slices/counterSlice";
import themeReducer from "./slices/themeSlice";
import tableReducer from "./slices/tableSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    theme: themeReducer,
    table: tableReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
