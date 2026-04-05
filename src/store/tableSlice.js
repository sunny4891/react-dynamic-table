import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  columnVisibility: {},
  data: [],
  total: 0,
  loading: false,
  error: null,
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    // 🔹 Column logic
    initializeColumns: (state, action) => {
      const { tableId, columns } = action.payload;

      if (!state.columnVisibility[tableId]) {
        state.columnVisibility[tableId] = Object.fromEntries(
          columns.map((col) => [col.field, true]),
        );
      }
    },

    toggleColumn: (state, action) => {
      const { tableId, field } = action.payload;
      state.columnVisibility[tableId][field] =
        !state.columnVisibility[tableId][field];
    },

    // 🔹 Saga triggers
    fetchUsersRequest: (state) => {
      state.loading = true;
    },

    fetchUsersSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload.data;
      state.total = action.payload.total;
    },

    fetchUsersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  initializeColumns,
  toggleColumn,
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
} = tableSlice.actions;

export default tableSlice.reducer;
