import { useEffect, useState } from "react";
import { fetchUsers } from "../services/api";

export const useUsers = (page, rowsPerPage, search) => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchUsers({
          page,
          limit: rowsPerPage,
          search,
        });

        if (active) {
          setData(res.data);
          setTotal(res.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [page, rowsPerPage, search]);

  return { data, total, loading };
};
