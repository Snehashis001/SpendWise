# SpendWise — Personal Expense Analyzer

A lightweight, visually impressive personal finance analyzer designed as an MCA mini project.

---

## 🚀 Key Highlights & Viva Points

- **Primary Technology: Python**
  All database operations, calculations, aggregations, and expense analyses happen strictly in Python using **SQLite3** and **Pandas**. React is used purely as a presentation layer.
- **Strict Constraints Respected**:
  - Exactly **2 SQLite tables**: `transactions` and `budgets`.
  - Exactly **7 core source files** (fewer than 8 files).
  - **Every source file stays below 200 LOC** after Ruff and Prettier formatting.
  - Zero bloated libraries: responsive dynamic charts and modern dark fintech UI.

---

## 🏛️ Application Architecture & Modules

### 1. Dashboard Module
- **KPI Metrics**: Total Balance, Current Month Income, Monthly Expenses, and Monthly Savings with Savings Rate percentage.
- **Income vs Expense Bar Chart**: Visual monthly comparison bars.
- **Spending Breakdown Chart**: Category expense donut chart.
- **Recent Transactions**: Instant snapshot of latest 5 entries.

### 2. Transactions Module
- **Full CRUD**: Add new income/expense, edit existing entries, and delete.
- **Live Search & Multi-Filters**: Filter by keyword (title/category), type (all/income/expense), and category.
- **Clear Badging**: Emerald for income, Rose for expense.

### 3. Expense Analysis Module (Pandas Engine)
- **Top Spending Category Banner**: Automatically detects the highest spending category with spent amount and total expense percentage.
- **Pandas Summary Statistics**: Mean expense, median expense, daily average spend, largest single transaction, and overall savings rate.
- **Category-wise Spending**: Visual progress bars representing percentage share per category.
- **Budget vs Actual Utilization**: Real-time tracking against category monthly limits from the `budgets` table (Status: *On Track*, *Near Limit*, *Exceeded*).
- **Monthly Comparison Table**: Month-by-month financial breakdown.

---

## 📂 Source Code Structure & LOC Report

| File Path | Purpose | Formatter | Lines of Code |
| :--- | :--- | :--- | :--- |
| `backend/analyzer.py` | SQLite schema, database connection, seed data, and Pandas analysis engine | Ruff | **189 LOC** (< 200) |
| `backend/main.py` | FastAPI application, REST endpoints, and static React host | Ruff | **141 LOC** (< 200) |
| `frontend/src/App.jsx` | App shell, tab router, transaction modal, and API state | Prettier | **195 LOC** (< 200) |
| `frontend/src/Dashboard.jsx` | Module 1: KPI cards, dynamic bar chart, donut chart, recent transactions | Prettier | **189 LOC** (< 200) |
| `frontend/src/Transactions.jsx` | Module 2: Search, category/type filter, and transactions table | Prettier | **155 LOC** (< 200) |
| `frontend/src/Analysis.jsx` | Module 3: Pandas statistical cards, progress bars, budget utilization | Prettier | **173 LOC** (< 200) |
| `frontend/src/index.css` | Graphite fintech theme, emerald/lime accents, typography, and controls | Prettier | **192 LOC** (< 200) |

*Total Core Source Files:* **7** (strictly fewer than 8).  
*Max Line Count in Any File:* **195 LOC** (strictly below 200).

---

## 💻 Windows Run Instructions

### Option 1: Run Full App in 1 Step (Recommended for Viva Demo)
The React frontend is already built into `backend/static`. You only need to run the Python backend:

```powershell
python -m uvicorn main:app --app-dir backend --port 8000
```
Open your browser at: **`http://127.0.0.1:8000`**

---

### Option 2: Run in Development Mode (Live Hot-Reload)

**Terminal 1 (Backend API):**
```powershell
python -m uvicorn main:app --app-dir backend --port 8000 --reload
```

**Terminal 2 (React Vite Frontend):**
```powershell
cd frontend
npm run dev
```
Open your browser at: **`http://localhost:5173`**

---

## 🎓 Viva Q&A Cheat Sheet (For MCA Students)

1. **Q: Where does the expense analysis take place?**
   *A:* In `backend/analyzer.py`. We load transactions into a Pandas DataFrame using `pd.read_sql_query`, perform grouping (`groupby`), compute descriptive statistics (`mean()`, `median()`, `max()`), aggregate monthly data with unstacking, and merge with the `budgets` table to track utilization.
2. **Q: What database is used and what is the schema?**
   *A:* SQLite3 (embedded in Python). It consists of two relational tables: `transactions` (id, title, amount, type, category, date, created_at) and `budgets` (id, category, monthly_limit).
3. **Q: How does React communicate with FastAPI?**
   *A:* React uses standard asynchronous `fetch` calls against RESTful endpoints (`/api/dashboard`, `/api/transactions`, `/api/analysis`). In production, FastAPI serves the compiled React SPA directly on port 8000.

