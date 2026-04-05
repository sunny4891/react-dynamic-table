import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, InputAdornment, TextField } from "@mui/material";
import ReusableTable from "../components/ReusableTable";
import { fetchUsersRequest } from "../store/tableSlice";
import { useDebounce } from "../hooks/useDebounce";
import SearchIcon from "@mui/icons-material/Search";

const UsersPage = () => {
  const dispatch = useDispatch();

  const { data, total, loading } = useSelector((state) => state.table);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  // 🔥 Trigger saga
  useEffect(() => {
    dispatch(
      fetchUsersRequest({
        page,
        rowsPerPage,
        search: debouncedSearch,
        sortBy: orderBy,
        order: order,
      }),
    );
  }, [dispatch, page, rowsPerPage, debouncedSearch, order, orderBy]);

  const columns = [
    { field: "id", headerName: "ID" },
    { field: "name", headerName: "Name" },
    { field: "email", headerName: "Email" },
    { field: "phone", headerName: "Phone" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users Table</h2>

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <TextField
          size="small" // ✅ smaller input
          placeholder="Search ID, name, email or phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ width: "250px" }} // ✅ control width
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon /> {/* 🔍 icon */}
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <ReusableTable
        tableId="usersTable"
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        order={order}
        orderBy={orderBy}
        onSortChange={(field, newOrder) => {
          setOrderBy(field);
          setOrder(newOrder);
          setPage(0);
        }}
      />
    </div>
  );
};

export default UsersPage;
