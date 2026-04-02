# Finance Dashboard UI (Frontend-only)

Interactive finance dashboard built for a frontend evaluation assignment. It uses **mock data only** and focuses on UI structure, state management, and user interactions.

## Features (mapped to requirements)

- **Dashboard overview**
  - Summary cards: Total Balance, Income, Expenses
  - Time-based visualization: Balance trend (last 30 days) as an SVG line chart
  - Categorical visualization: Spending breakdown as an SVG donut chart
- **Transactions section**
  - Table with Date, Amount, Category, Type, Description
  - Search, filters (type/category/date range), sorting
  - Empty / no-match states
- **Basic role-based UI (simulated)**
  - Role switcher: Viewer vs Admin
  - Viewer is read-only (Add/Edit/Delete disabled)
  - Admin can Add/Edit/Delete transactions (modal form)
- **Insights section**
  - Highest spending category
  - Monthly expense comparison + MoM change
  - Estimated savings rate
- **State management**
  - Centralized store via React Context + `useReducer`
  - Persistence via `localStorage` (`financeDashboard.v1`)
- **UI/UX**
  - Responsive layout
  - Dark/Light/System theme switch (no backend)

## Tech
- React + Vite
- No backend; all data is mock/static and persisted locally

## Getting started
Prerequisite: install **Node.js** (includes `npm`) from the official site.

From the `frontend/` folder:

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Notes
- **Reset data** button restores the default seeded dataset.
- All calculations (summary, charts, insights) are derived from the current transactions list in state.
