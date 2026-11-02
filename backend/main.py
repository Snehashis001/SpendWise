from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from pathlib import Path
from typing import Optional

from analyzer import init_db, get_db, get_dashboard_summary, get_detailed_analysis

app = FastAPI(title="SpendWise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TransactionModel(BaseModel):
    title: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    type: str = Field(..., pattern="^(income|expense)$")
    category: str = Field(..., min_length=1)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/dashboard")
def dashboard():
    summary = get_dashboard_summary()
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM transactions ORDER BY date DESC, id DESC LIMIT 5"
        ).fetchall()
        summary["recent_transactions"] = [dict(r) for r in rows]
    return summary


@app.get("/api/transactions")
def list_transactions(
    search: Optional[str] = None,
    type: Optional[str] = None,
    category: Optional[str] = None,
):
    query = "SELECT * FROM transactions WHERE 1=1"
    params = []
    if search:
        query += " AND (title LIKE ? OR category LIKE ?)"
        params.extend([f"%{search}%", f"%{search}%"])
    if type and type in ["income", "expense"]:
        query += " AND type = ?"
        params.append(type)
    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
    query += " ORDER BY date DESC, id DESC"

    with get_db() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


@app.post("/api/transactions", status_code=201)
def add_transaction(t: TransactionModel):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO transactions (title, amount, type, category, date)
            VALUES (?, ?, ?, ?, ?)
            """,
            (t.title.strip(), t.amount, t.type, t.category.strip(), t.date),
        )
        conn.commit()
        return {"id": cursor.lastrowid, "message": "Transaction created"}


@app.put("/api/transactions/{tx_id}")
def update_transaction(tx_id: int, t: TransactionModel):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            UPDATE transactions
            SET title = ?, amount = ?, type = ?, category = ?, date = ?
            WHERE id = ?
            """,
            (t.title.strip(), t.amount, t.type, t.category.strip(), t.date, tx_id),
        )
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Transaction not found")
        conn.commit()
        return {"message": "Transaction updated"}


@app.delete("/api/transactions/{tx_id}")
def delete_transaction(tx_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM transactions WHERE id = ?", (tx_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Transaction not found")
        conn.commit()
        return {"message": "Transaction deleted"}


@app.get("/api/analysis")
def expense_analysis():
    return get_detailed_analysis()


@app.get("/api/budgets")
def list_budgets():
    with get_db() as conn:
        rows = conn.execute("SELECT * FROM budgets ORDER BY category").fetchall()
        return [dict(r) for r in rows]


static_dir = Path(__file__).resolve().parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

    @app.get("/{full_path:path}")
    def serve_react(full_path: str):
        file = static_dir / full_path
        if file.is_file():
            return FileResponse(file)
        return FileResponse(static_dir / "index.html")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
