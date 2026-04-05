import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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

// 🔹 Draggable Header Cell
const DraggableHeader = ({ column, handleSort, orderBy, order }) => {
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableCell
      ref={setNodeRef}
      style={style}
      sx={{
        fontWeight: 700,
        fontSize: "16px",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        backgroundColor: "#1976d2",
        color: "#fff",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        style={{
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
    </TableCell>
  );
};

const ReusableTable = ({
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
  const StyledRow = styled(TableRow)(({ theme }) => ({
    "&.selected": {
      backgroundColor: "#bbdefb",
    },
  }));

  // 🔹 Sorting
  const handleSort = (field) => {
    const isAsc = orderBy === field && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";

    onSortChange(field, newOrder);
    setPage(0); // reset page
  };

  // 🔹 Drag End Logic
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.findIndex((c) => c.field === active.id);
      const newIndex = columnOrder.findIndex((c) => c.field === over.id);

      setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  return (
    <Paper>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={columnOrder.map((c) => c.field)}
          strategy={horizontalListSortingStrategy}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {/* ✅ Select All */}
                  <TableCell>
                    <Checkbox
                      checked={
                        data.length > 0 && selectedRows.length === data.length
                      }
                      indeterminate={
                        selectedRows.length > 0 &&
                        selectedRows.length < data.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          dispatch(selectAllRows(data.map((row) => row.id)));
                        } else {
                          dispatch(selectAllRows([]));
                        }
                      }}
                    />
                  </TableCell>

                  {columnOrder.map((col) => (
                    <DraggableHeader
                      key={col.field}
                      column={col}
                      handleSort={handleSort}
                      orderBy={orderBy}
                      order={order}
                    />
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {data.map((row) => {
                  const isSelected = selectedRows.includes(row.id);

                  return (
                    <StyledRow key={row.id}>
                      {/* ✅ Row Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => dispatch(toggleRowSelection(row.id))}
                        />
                      </TableCell>

                      {columnOrder.map((col) => (
                        <TableCell key={col.field}>{row[col.field]}</TableCell>
                      ))}
                    </StyledRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </SortableContext>
      </DndContext>

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 15]} // ✅ HERE
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
};

export default ReusableTable;
