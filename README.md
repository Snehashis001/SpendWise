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

