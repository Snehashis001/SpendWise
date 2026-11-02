import React from "react";

const fmt = (n) => `₹${(n || 0).toLocaleString()}`;

export default function Analysis({ data = {} }) {
  const {
    highest_category: top,
    summary_stats: s = {},
    categories = [],
    monthly_comparison = [],
    budget_status = [],
  } = data;
  const stats = [
    ["Average Expense", fmt(s.average_expense), "#3B82F6"],
    ["Daily Average", fmt(s.daily_average), "#10B981"],
    ["Highest Single", fmt(s.highest_expense), "#F43F5E"],
    ["Total Expenses", fmt(s.total_expenses), "#8B5CF6"],
    ["Expense Count", s.expense_count || 0, "#06B6D4"],
    ["Savings Rate", `${s.savings_rate || 0}%`, "#84CC16"],
  ];

  return (
    <div>
      {top && (
        <div
          className="card"
          style={{
            marginBottom: 14,
            borderLeft: "4px solid #10B981",
            background: "linear-gradient(90deg, #102324 0%, #101726 100%)",
          }}
        >
          <div className="kpi-label" style={{ color: "#10B981" }}>
            TOP SPENDING CATEGORY (PANDAS INSIGHT)
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {top.category} — {fmt(top.amount)}{" "}
            <span style={{ fontSize: 13, color: "#94a3b8" }}>
              ({top.percentage}% of total expenses)
            </span>
          </div>
        </div>
      )}

      <div
        className="kpi-grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          marginBottom: 16,
        }}
      >
        {stats.map(([l, v, c]) => (
          <div className="card" key={l} style={{ padding: 12 }}>
            <div className="kpi-label">{l}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ marginBottom: 16 }}>
        <div className="card">
          <strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>
            Category Spending Breakdown
          </strong>
          {categories.map((c) => (
            <div key={c.category} style={{ marginBottom: 8 }}>
              <div
                className="flex"
                style={{ justifyContent: "space-between", fontSize: 12 }}
              >
                <span>{c.category}</span>
                <span style={{ color: "#94a3b8" }}>
                  {fmt(c.amount)} ({c.percentage}%)
                </span>
              </div>
              <div className="bar-track">
                <div
                  style={{
                    height: "100%",
                    borderRadius: 4,
                    background: "#10B981",
                    width: `${c.percentage}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <strong style={{ fontSize: 13, display: "block", marginBottom: 10 }}>
            Budget vs Actual Spending
          </strong>
          {budget_status.map((b) => (
            <div key={b.category} style={{ marginBottom: 8 }}>
              <div
                className="flex"
                style={{ justifyContent: "space-between", fontSize: 12 }}
              >
                <span>{b.category}</span>
                <span
                  style={{
                    color:
                      b.status === "Exceeded"
                        ? "#F43F5E"
                        : b.status === "Near Limit"
                          ? "#F59E0B"
                          : "#10B981",
                    fontWeight: 600,
                  }}
                >
                  {b.utilization}% ({b.status})
                </span>
              </div>
              <div className="bar-track">
                <div
                  style={{
                    height: "100%",
                    borderRadius: 4,
                    width: `${Math.min(b.utilization, 100)}%`,
                    background:
                      b.status === "Exceeded"
                        ? "#F43F5E"
                        : b.status === "Near Limit"
                          ? "#F59E0B"
                          : "#10B981",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <strong style={{ fontSize: 13, display: "block", marginBottom: 8 }}>
          Monthly Expense Comparison
        </strong>
        <table>
          <thead>
            <tr>
              {["Month", "Income", "Expense", "Savings", "Savings Rate"].map(
                (h) => (
                  <th key={h}>{h}</th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {monthly_comparison.map((m) => (
              <tr key={m.month}>
                <td style={{ fontWeight: 600 }}>{m.month}</td>
                <td style={{ color: "#10B981" }}>+{fmt(m.income)}</td>
                <td style={{ color: "#F43F5E" }}>-{fmt(m.expense)}</td>
                <td
                  style={{
                    fontWeight: 700,
                    color: m.savings >= 0 ? "#10B981" : "#F43F5E",
                  }}
                >
                  {fmt(m.savings)}
                </td>
                <td>
                  <span className="badge badge-income">{m.savings_rate}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
