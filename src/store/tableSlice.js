import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  columnVisibility: {},
  data: [],
  total: 0,
  loading: false,
  error: null,
  selectedRows: [], // ✅ NEW
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
    toggleRowSelection: (state, action) => {
      const id = action.payload;

      if (state.selectedRows.includes(id)) {
        state.selectedRows = state.selectedRows.filter((rowId) => rowId !== id);
      } else {
        state.selectedRows.push(id);
      }
    },

    selectAllRows: (state, action) => {
      state.selectedRows = action.payload; // array of all ids
    },

    clearSelection: (state) => {
      state.selectedRows = [];
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
  toggleRowSelection,
  selectAllRows,
  clearSelection,
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
} = tableSlice.actions;

export default tableSlice.reducer;
