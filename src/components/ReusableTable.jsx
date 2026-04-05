import React, { useState, useMemo, useCallback, memo } from "react";
import {
  TableCell,
  TableRow,
  TableSortLabel,
  TablePagination,
  Paper,
} from "@mui/material";

import { DndContext, closestCenter } from "@dnd-kit/core";
import { Checkbox } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { toggleRowSelection, selectAllRows } from "../store/tableSlice";

import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { styled } from "@mui/material/styles";

// 🔹 Styled Row Component (moved outside for global access)
const StyledRow = styled(TableRow)(({ theme }) => ({
  "&.selected": {
    backgroundColor: "#bbdefb",
  },
}));

// 🔹 Memoized Row Component
const TableRowItem = memo(({ row, sortedColumns, isSelected, onRowSelect }) => (
  <StyledRow className={isSelected ? "selected" : ""}>
    <TableCell>
      <Checkbox checked={isSelected} onChange={() => onRowSelect(row.id)} />
    </TableCell>
    {sortedColumns.map((col) => (
      <TableCell key={col.field}>{row[col.field]}</TableCell>
    ))}
  </StyledRow>
));

TableRowItem.displayName = "TableRowItem";

// 🔹 Draggable Column Header Component
const DraggableColumnHeader = memo(({ column, handleSort, orderBy, order }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.field,
  });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }),
    [transform, transition, isDragging],
  );

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        ...(column.width
          ? {
              width: column.width,
              minWidth: column.width,
              maxWidth: column.width,
              flexShrink: 0,
              boxSizing: "border-box",
            }
          : { flex: 1 }),
        padding: column.field === "id" ? "4px 4px" : "4px 8px",
        cursor: "pointer",
        userSelect: "none",
        touchAction: "none",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          padding: "4px",
          borderRadius: "2px",
          display: "flex",
          alignItems: "center",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        ⋮⋮
      </div>

      {/* Sort Label */}
      <TableSortLabel
        active={orderBy === column.field}
        direction={order}
        onClick={(e) => {
          e.stopPropagation();
          handleSort(column.field);
        }}
        sx={{
          color: "inherit",
          flex: 1,
          "&:hover": {
            color: "inherit",
          },
          "& .MuiTableSortLabel__icon": {
            color: "inherit !important",
          },
        }}
      >
        {column.headerName}
      </TableSortLabel>
    </div>
  );
});

DraggableColumnHeader.displayName = "DraggableColumnHeader";

const ReusableTable = memo(
  ({
    columns,
    data,
    loading,
    total,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
    order,
    orderBy,
    onSortChange,
  }) => {
    const [columnOrder, setColumnOrder] = useState(columns);
    const dispatch = useDispatch();
    const selectedRows = useSelector((state) => state.table.selectedRows);

    // Memoized sorted columns
    const sortedColumns = useMemo(() => columnOrder, [columnOrder]);

    const gridTemplateColumns = useMemo(
      () =>
        [
          "50px", // checkbox column
          ...sortedColumns.map((col) =>
            col.width ? col.width : "minmax(0, 1fr)",
          ),
        ].join(" "),
      [sortedColumns],
    );

    // Memoized handlers
    const handleSort = useCallback(
      (field) => {
        const isAsc = orderBy === field && order === "asc";
        const newOrder = isAsc ? "desc" : "asc";

        onSortChange(field, newOrder);
        setPage(0); // reset page
      },
      [orderBy, order, onSortChange, setPage],
    );

    const handleDragEnd = useCallback(
      (event) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
          const oldIndex = sortedColumns.findIndex(
            (c) => c.field === active.id,
          );
          const newIndex = sortedColumns.findIndex((c) => c.field === over.id);

          setColumnOrder(arrayMove(sortedColumns, oldIndex, newIndex));
        }
      },
      [sortedColumns],
    );

    const handleSelectAll = useCallback(
      (e) => {
        if (e.target.checked) {
          dispatch(selectAllRows(data.map((row) => row.id)));
        } else {
          dispatch(selectAllRows([]));
        }
      },
      [dispatch, data],
    );

    const handleRowSelect = useCallback(
      (rowId) => {
        dispatch(toggleRowSelection(rowId));
      },
      [dispatch],
    );

    // Memoized selected rows check
    const allSelected = useMemo(
      () => data.length > 0 && selectedRows.length === data.length,
      [data.length, selectedRows.length],
    );

    const someSelected = useMemo(
      () => selectedRows.length > 0 && selectedRows.length < data.length,
      [selectedRows.length, data.length],
    );

    return (
      <Paper>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedColumns.map((c) => c.field)}
            strategy={horizontalListSortingStrategy}
          >
            {/* Virtualized Table Container - Temporarily simplified */}
            <div style={{ border: "1px solid #e0e0e0", borderRadius: "4px" }}>
              {/* Fixed Header */}
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  backgroundColor: "#fff",
                  borderBottom: "2px solid #1976d2",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: gridTemplateColumns,
                    alignItems: "center",
                    padding: "8px 16px",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  {/* Select All Checkbox */}
                  <div style={{ width: "50px", flexShrink: 0 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={handleSelectAll}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": { color: "#fff" },
                        "&.MuiCheckbox-indeterminate": { color: "#fff" },
                        padding: "4px",
                      }}
                    />
                  </div>

                  {/* Column Headers */}
                  {sortedColumns.map((col) => (
                    <DraggableColumnHeader
                      key={col.field}
                      column={col}
                      handleSort={handleSort}
                      orderBy={orderBy}
                      order={order}
                    />
                  ))}
                </div>
              </div>

              {/* Table Body */}
              <div style={{ maxHeight: "400px", overflow: "auto" }}>
                {data.map((row, index) => {
                  const isSelected = selectedRows.includes(row.id);

                  return (
                    <div
                      key={row.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: gridTemplateColumns,
                        alignItems: "center",
                        padding: "8px 16px",
                        borderBottom: "1px solid #e0e0e0",
                        backgroundColor: isSelected
                          ? "#bbdefb"
                          : index % 2 === 0
                            ? "#f9f9f9"
                            : "transparent",
                      }}
                    >
                      {/* Row Checkbox */}
                      <div style={{ width: "50px", flexShrink: 0 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleRowSelect(row.id)}
                          sx={{ padding: "4px" }}
                        />
                      </div>

                      {/* Row Data */}
                      {sortedColumns.map((col) => (
                        <div
                          key={col.field}
                          style={{
                            ...(col.width
                              ? {
                                  width: col.width,
                                  minWidth: col.width,
                                  maxWidth: col.width,
                                  flexShrink: 0,
                                  boxSizing: "border-box",
                                  padding: "4px 4px",
                                  textAlign:
                                    col.field === "id" ? "center" : "left",
                                }
                              : { width: "100%", padding: "4px 8px" }),
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row[col.field]}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </SortableContext>
        </DndContext>

        <TablePagination
          component="div"
          count={total}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 15]}
          onPageChange={(e, newPage) => {
            setPage(newPage);
          }}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    );
  },
);

export default ReusableTable;

ReusableTable.displayName = "ReusableTable";
