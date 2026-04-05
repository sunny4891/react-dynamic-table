import axios from "axios";

const API = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

// Simulated server-side API
export const fetchUsers = async ({ page, limit, search, sortBy, order }) => {
  const res = await API.get("/users");
  let data = res.data;

  // 🔍 search across multiple fields
  if (search) {
    const normalized = search.toLowerCase();

    data = data.filter((user) => {
      const idValue = String(user.id || "").toLowerCase();
      const nameValue = String(user.name || "").toLowerCase();
      const emailValue = String(user.email || "").toLowerCase();
      const phoneValue = String(user.phone || "").toLowerCase();

      return (
        idValue.includes(normalized) ||
        nameValue.includes(normalized) ||
        emailValue.includes(normalized) ||
        phoneValue.includes(normalized)
      );
    });
  }

  // 🔥 sorting (simulate server)
  if (sortBy && sortBy !== "") {
    data.sort((a, b) => {
      let aVal = a[sortBy] || "";
      let bVal = b[sortBy] || "";

      // Check if both values are numeric
      const aNum = Number(aVal);
      const bNum = Number(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        // Numeric comparison
        return order === "asc" ? aNum - bNum : bNum - aNum;
      }

      // String comparison
      aVal = String(aVal).toLowerCase();
      bVal = String(bVal).toLowerCase();

      if (aVal < bVal) return order === "asc" ? -1 : 1;
      if (aVal > bVal) return order === "asc" ? 1 : -1;
      return 0;
    });
  }

  const total = data.length;

  const start = page * limit;
  const paginated = data.slice(start, start + limit);

  return { data: paginated, total };
};
