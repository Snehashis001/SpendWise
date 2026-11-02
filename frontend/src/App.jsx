import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Dashboard from "./Dashboard";
import Transactions from "./Transactions";
import Analysis from "./Analysis";

const API = "/api";
const CATS = ["Housing", "Food", "Utilities", "Transport", "Health"];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [summary, setSummary] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };
  const load = async () => {
    const [d, t, a] = await Promise.all([
      fetch(`${API}/dashboard`).then((r) => r.json()),
      fetch(`${API}/transactions`).then((r) => r.json()),
      fetch(`${API}/analysis`).then((r) => r.json()),
    ]);
    setSummary(d);
    setTransactions(t);
    setAnalysis(a);
  };

  useEffect(() => {
    load();
  }, []);

  const saveTx = async (e) => {
    e.preventDefault();
    const res = await fetch(
      `${API}/transactions${modal.id ? `/${modal.id}` : ""}`,
      {
        method: modal.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...modal,
          amount: +modal.amount,
          date: modal.date || new Date().toISOString().slice(0, 10),
        }),
      },
    );
    if (res.ok) {
      notify(modal.id ? "Updated" : "Added");
      setModal(null);
      load();
    }
  };

  const deleteTx = async (id) => {
    if (window.confirm("Delete?")) {
      await fetch(`${API}/transactions/${id}`, { method: "DELETE" });
      notify("Deleted");
      load();
    }
  };

  const upd = (k, v) => setModal((m) => ({ ...m, [k]: v }));
  const openNew = () => setModal({ type: "expense", category: "Food" });
  const inp = (k, t, p) => (
    <input
      required={k !== "date"}
      type={t}
      step={t === "number" ? "0.01" : undefined}
      className="ctrl"
      placeholder={p}
      value={
        modal[k] || (k === "date" ? new Date().toISOString().slice(0, 10) : "")
      }
      onChange={(e) => upd(k, e.target.value)}
    />
  );

  return (
    <div className="app-shell">
      <header>
        <div className="brand">
          <div className="logo-icon">₹</div>
          <div className="brand-name">
            Spend<span>Wise</span>
          </div>
        </div>
        <div className="nav-pills">
          {["dashboard", "transactions", "analysis"].map((k) => (
            <button
              key={k}
              className={`nav-pill ${tab === k ? "active" : ""}`}
              onClick={() => setTab(k)}
            >
              {k === "analysis"
                ? "Expense Analysis"
                : k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + New Entry
        </button>
      </header>

      {tab === "dashboard" && (
        <Dashboard summary={summary} onNavigate={setTab} />
      )}
      {tab === "transactions" && (
        <Transactions
          transactions={transactions}
          onEdit={setModal}
          onDelete={deleteTx}
          onNew={openNew}
        />
      )}
      {tab === "analysis" && <Analysis data={analysis} />}

      {modal && (
        <div className="modal-bg">
          <form className="modal" onSubmit={saveTx}>
            <div
              className="flex"
              style={{ justifyContent: "space-between", marginBottom: 10 }}
            >
              <strong style={{ fontSize: 14 }}>
                {modal.id ? "Edit Entry" : "New Entry"}
              </strong>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ padding: "2px 6px" }}
                onClick={() => setModal(null)}
              >
                ✕
              </button>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {inp("title", "text", "Title")}
              {inp("amount", "number", "Amount (₹)")}
              <div className="flex" style={{ gap: 8 }}>
                <select
                  className="ctrl"
                  style={{ flex: 1 }}
                  value={modal.type}
                  onChange={(e) => upd("type", e.target.value)}
                >
                  <option value="expense">expense</option>
                  <option value="income">income</option>
                </select>
                <select
                  className="ctrl"
                  style={{ flex: 1 }}
                  value={modal.category}
                  onChange={(e) => upd("category", e.target.value)}
                >
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              {inp("date", "date", "Date")}
              <div
                className="flex"
                style={{ justifyContent: "flex-end", gap: 8, marginTop: 4 }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modal.id ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

const el = document.getElementById("root");
if (el) createRoot(el).render(<App />);
