import sqlite3
from pathlib import Path
import pandas as pd

DB_PATH = Path(__file__).resolve().parent / "spendwise.db"
RAW_SEEDS = "Salary,65000,income,Salary,2026-10-01|Rent,18000,expense,Housing,2026-10-01|Groceries,6200,expense,Food,2026-10-05|Freelance,22000,income,Freelance,2026-10-10|Utilities,3400,expense,Utilities,2026-10-12|Dining,2800,expense,Food,2026-10-16|Transport,3100,expense,Transport,2026-10-18|Health,2500,expense,Health,2026-10-21|Shopping,4500,expense,Shopping,2026-10-25|Salary,65000,income,Salary,2026-11-01|Rent,18000,expense,Housing,2026-11-01|Groceries,4800,expense,Food,2026-10-27|Retainer,15000,income,Freelance,2026-10-28|Phone,1800,expense,Utilities,2026-10-29"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        c = conn.cursor()
        c.execute(
            "CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, amount REAL NOT NULL, type TEXT NOT NULL CHECK(type IN ('income','expense')), category TEXT NOT NULL, date TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
        )
        c.execute(
            "CREATE TABLE IF NOT EXISTS budgets (id INTEGER PRIMARY KEY AUTOINCREMENT, category TEXT UNIQUE NOT NULL, monthly_limit REAL NOT NULL)"
        )
        if c.execute("SELECT COUNT(*) FROM transactions").fetchone()[0] == 0:
            seeds = [
                tuple(float(x) if i == 1 else x for i, x in enumerate(r.split(",")))
                for r in RAW_SEEDS.split("|")
            ]
            c.executemany(
                "INSERT INTO transactions (title, amount, type, category, date) VALUES (?,?,?,?,?)",
                seeds,
            )
            budgets = [("Housing", 20000.0), ("Food", 10000.0), ("Utilities", 5000.0)]
            c.executemany(
                "INSERT OR IGNORE INTO budgets (category, monthly_limit) VALUES (?,?)",
                budgets,
            )
        conn.commit()


def get_df():
    with get_db() as conn:
        df = pd.read_sql_query(
            "SELECT id, title, amount, type, category, date FROM transactions", conn
        )
    if not df.empty:
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce").fillna(0.0)
        df["date"] = pd.to_datetime(df["date"], errors="coerce")
        df["month"] = df["date"].dt.strftime("%Y-%m")
    return df


def get_monthly_summary(df):
    if df.empty:
        return []
    m = (
        df.groupby(["month", "type"])["amount"]
        .sum()
        .unstack(fill_value=0.0)
        .reset_index()
    )
    for col in ["income", "expense"]:
        if col not in m.columns:
            m[col] = 0.0
    m["savings"] = m["income"] - m["expense"]
    m["savings_rate"] = (
        (m["savings"] / m["income"] * 100).where(m["income"] > 0, 0.0).round(1)
    )
    return m.sort_values("month", ascending=False)


def get_dashboard_summary():
    df = get_df()
    if df.empty:
        return {
            "total_balance": 0.0,
            "monthly_income": 0.0,
            "monthly_expenses": 0.0,
            "savings": 0.0,
            "savings_rate": 0.0,
            "bar_chart": [],
            "pie_chart": [],
        }
    t_inc = float(df[df["type"] == "income"]["amount"].sum())
    t_exp = float(df[df["type"] == "expense"]["amount"].sum())
    lm = df["month"].dropna().max()
    cdf = df[df["month"] == lm]
    mi = float(cdf[cdf["type"] == "income"]["amount"].sum())
    me = float(cdf[cdf["type"] == "expense"]["amount"].sum())
    ms = round(mi - me, 2)

    m = get_monthly_summary(df)
    bar_chart = [
        {
            "month": r["month"],
            "income": round(float(r["income"]), 2),
            "expense": round(float(r["expense"]), 2),
        }
        for _, r in m.sort_values("month").iterrows()
    ]

    edf = df[df["type"] == "expense"]
    cs = (
        edf.groupby("category")["amount"].sum().sort_values(ascending=False)
        if not edf.empty
        else {}
    )
    pie_chart = (
        [
            {
                "category": k,
                "amount": round(float(v), 2),
                "percentage": round(float(v / t_exp * 100), 1),
            }
            for k, v in cs.items()
        ]
        if t_exp > 0
        else []
    )

    return {
        "total_balance": round(t_inc - t_exp, 2),
        "monthly_income": round(mi, 2),
        "monthly_expenses": round(me, 2),
        "savings": ms,
        "savings_rate": round(ms / mi * 100, 1) if mi > 0 else 0.0,
        "latest_month": lm,
        "bar_chart": bar_chart,
        "pie_chart": pie_chart,
    }


def get_detailed_analysis():
    df = get_df()
    edf = df[df["type"] == "expense"] if not df.empty else pd.DataFrame()
    if edf.empty:
        return {
            "highest_category": None,
            "summary_stats": {},
            "categories": [],
            "monthly_comparison": [],
            "budget_status": [],
        }

    te, ti = (
        float(edf["amount"].sum()),
        float(df[df["type"] == "income"]["amount"].sum()),
    )
    cgrp = (
        edf.groupby("category")["amount"]
        .agg(amount="sum", count="count")
        .reset_index()
        .sort_values(by="amount", ascending=False)
    )
    cgrp["percentage"] = (cgrp["amount"] / te * 100).round(1) if te > 0 else 0.0
    top = cgrp.iloc[0]

    s = edf["amount"]
    days = max(1, (edf["date"].max() - edf["date"].min()).days + 1)
    stats = {
        "total_expenses": round(te, 2),
        "average_expense": round(float(s.mean()), 2),
        "median_expense": round(float(s.median()), 2),
        "highest_expense": round(float(s.max()), 2),
        "expense_count": int(s.count()),
        "daily_average": round(float(te / days), 2),
        "savings_rate": round((ti - te) / ti * 100, 1) if ti > 0 else 0.0,
    }

    with get_db() as conn:
        bdf = pd.read_sql_query("SELECT category, monthly_limit FROM budgets", conn)
    m = pd.merge(bdf, cgrp, on="category", how="left").fillna(0.0)
    m["utilization"] = (m["amount"] / m["monthly_limit"] * 100).round(1)
    m["status"] = m["utilization"].apply(
        lambda x: "Exceeded" if x > 100 else ("Near Limit" if x >= 80 else "On Track")
    )

    return {
        "highest_category": {
            "category": str(top["category"]),
            "amount": round(float(top["amount"]), 2),
            "percentage": float(top["percentage"]),
        },
        "summary_stats": stats,
        "categories": cgrp.to_dict(orient="records"),
        "monthly_comparison": get_monthly_summary(df).to_dict(orient="records"),
        "budget_status": m[
            ["category", "monthly_limit", "amount", "utilization", "status"]
        ].to_dict(orient="records"),
    }
