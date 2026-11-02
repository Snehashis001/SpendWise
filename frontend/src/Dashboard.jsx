import React from "react";

const PALETTE = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
];
const fmt = (n) => `₹${(n || 0).toLocaleString()}`;
const barStyle = (h, bg) => ({
  width: 12,
  height: `${h}%`,
  background: bg,
  borderRadius: 2,
});

function BarChart({ data = [] }) {
  if (!data.length) return <p style={{ color: "#94a3b8" }}>No data</p>;
  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 100);
  return (
    <div>
      <div
        className="flex"
        style={{ height: 95, alignItems: "flex-end", gap: 14 }}
      >
        {data.map((d) => (
          <div key={d.month} style={{ flex: 1, textAlign: "center" }}>
            <div
              className="flex"
              style={{
                height: 75,
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <div style={barStyle((d.income / max) * 100, "#10B981")} />
              <div style={barStyle((d.expense / max) * 100, "#F43F5E")} />
            </div>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>
              {d.month.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <div
        className="flex"
        style={{
          gap: 12,
          justifyContent: "center",
          fontSize: 11,
          marginTop: 4,
        }}
      >
        <span style={{ color: "#10B981" }}>■ Income</span>
        <span style={{ color: "#F43F5E" }}>■ Expense</span>
      </div>
    </div>
  );
}

function DonutChart({ data = [] }) {
  if (!data.length) return <p style={{ color: "#94a3b8" }}>No expenses</p>;
  let c = 0;
  const grad = data
    .map((d, i) => `${PALETTE[i % 6]} ${c}% ${(c += d.percentage)}%`)
    .join(", ");
  const donutStyle = {
    width: 70,
    height: 70,
    borderRadius: "50%",
    background: `conic-gradient(${grad})`,
    mask: "radial-gradient(circle, transparent 52%, #000 53%)",
    WebkitMask: "radial-gradient(circle, transparent 52%, #000 53%)",
  };
  return (
    <div className="flex" style={{ gap: 14 }}>
      <div style={donutStyle} />
      <div style={{ flex: 1, fontSize: 11 }}>
        {data.slice(0, 4).map((d, i) => (
          <div
            key={d.category}
            className="flex"
            style={{ justifyContent: "space-between", marginBottom: 2 }}
          >
            <span style={{ color: PALETTE[i % 6] }}>● {d.category}</span>
            <span style={{ color: "#94a3b8" }}>{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ summary, onNavigate }) {
  const cards = [
    ["Total Balance", fmt(summary.total_balance), "#10B981"],
    ["Monthly Income", fmt(summary.monthly_income), "#10B981"],
    ["Monthly Expenses", fmt(summary.monthly_expenses), "#F43F5E"],
    ["Monthly Savings", fmt(summary.savings), "#84CC16"],
  ];
  return (
    <div>
      <div className="kpi-grid">
        {cards.map(([l, v, c]) => (
          <div className="card" key={l}>
            <div className="kpi-label">{l}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="charts-grid">
        <div className="card">
          <div
            className="flex"
            style={{ justifyContent: "space-between", marginBottom: 6 }}
          >
            <strong style={{ fontSize: 13 }}>Income vs Expense</strong>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Monthly</span>
          </div>
          <BarChart data={summary.bar_chart} />
        </div>
        <div className="card">
          <div
            className="flex"
            style={{ justifyContent: "space-between", marginBottom: 6 }}
          >
            <strong style={{ fontSize: 13 }}>Spending Breakdown</strong>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>Categories</span>
          </div>
          <DonutChart data={summary.pie_chart} />
        </div>
      </div>
      <div className="card">
        <div
          className="flex"
          style={{ justifyContent: "space-between", marginBottom: 8 }}
        >
          <strong style={{ fontSize: 13 }}>Recent Transactions</strong>
          <button
            className="btn btn-ghost"
            style={{ padding: "4px 8px" }}
            onClick={() => onNavigate("transactions")}
          >
            View All →
          </button>
        </div>
        <table>
          <thead>
            <tr>
              {["Date", "Title", "Category", "Type", "Amount"].map((h) => (
                <th
                  key={h}
                  style={{ textAlign: h === "Amount" ? "right" : "left" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(summary.recent_transactions || []).map((t) => (
              <tr key={t.id}>
                <td style={{ color: "#94a3b8" }}>{t.date}</td>
                <td>{t.title}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
