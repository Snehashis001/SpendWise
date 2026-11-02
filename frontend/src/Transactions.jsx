import React, { useState } from "react";

const fmt = (n) => `₹${(n || 0).toLocaleString()}`;
const CATS = [
  "All",
  "Housing",
  "Food",
  "Utilities",
  "Transport",
  "Health",
  "Shopping",
  "Salary",
  "Freelance",
];

export default function Transactions({
  transactions = [],
  onEdit,
  onDelete,
  onNew,
}) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All");
  const [cat, setCat] = useState("All");

  const filtered = transactions.filter((t) => {
    const s = search.toLowerCase();
    const mSearch =
      t.title.toLowerCase().includes(s) || t.category.toLowerCase().includes(s);
    return (
      mSearch &&
      (type === "All" || t.type === type) &&
      (cat === "All" || t.category === cat)
    );
  });

  return (
    <div className="card">
      <div
        className="flex"
        style={{
          justifyContent: "space-between",
          marginBottom: 12,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
          <input
            className="ctrl"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="ctrl"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            className="ctrl"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {CATS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" onClick={onNew}>
          + Add Transaction
        </button>
      </div>

      <table>
        <thead>
          <tr>
            {["Date", "Title", "Category", "Type", "Amount", "Actions"].map(
              (h) => (
                <th
                  key={h}
                  style={{
                    textAlign:
                      h === "Amount"
                        ? "right"
                        : h === "Actions"
                          ? "center"
                          : "left",
                  }}
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td
                colSpan="6"
                style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}
              >
                No transactions found
              </td>
            </tr>
          ) : (
            filtered.map((t) => (
              <tr key={t.id}>
                <td style={{ color: "#94a3b8" }}>{t.date}</td>
                <td style={{ fontWeight: 600 }}>{t.title}</td>
                <td>{t.category}</td>
                <td>
                  <span className={`badge badge-${t.type}`}>{t.type}</span>
                </td>
                <td
                  style={{
                    textAlign: "right",
                    fontWeight: 700,
                    color: t.type === "income" ? "#10B981" : "#F43F5E",
                  }}
                >
                  {t.type === "income" ? "+" : "-"}
                  {fmt(t.amount)}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 8px", marginRight: 6 }}
                    onClick={() => onEdit(t)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    style={{ padding: "4px 8px" }}
                    onClick={() => onDelete(t.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
