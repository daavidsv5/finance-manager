@AGENTS.md

# Finance Manager — Project Overview

## Stack
- **Framework:** Next.js 16.2.3 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + @base-ui/react
- **Tables:** @tanstack/react-table v8
- **Charts:** recharts v3
- **Icons:** lucide-react
- **State:** React Context API + localStorage (no backend)

## Project Structure
```
src/
├── app/
│   ├── page.tsx                    # Root redirect (login / dashboard)
│   ├── login/page.tsx              # Mock auth login screen
│   └── dashboard/
│       ├── layout.tsx              # Dashboard layout with sidebar nav
│       ├── page.tsx                # Main overview (totals summary)
│       ├── monthly/page.tsx        # Monthly expenses
│       ├── education/page.tsx      # Education expenses
│       ├── income/page.tsx         # Income
│       └── investments/page.tsx    # Investments
├── components/
│   ├── ui/                         # Shared UI primitives
│   ├── data-table/                 # TanStack Table wrappers
│   ├── forms/                      # Add-record forms
│   ├── widgets/                    # SummaryCard etc.
│   └── layout/Sidebar.tsx
├── lib/
│   ├── store.tsx                   # Context + localStorage (add/delete for all entities)
│   ├── auth.tsx                    # Mock auth
│   ├── initialData.ts              # Seed data
│   ├── format.ts                   # Currency / date formatting
│   └── utils.ts
└── types/index.ts                  # AppState, MonthlyExpense, EducationExpense, Income, Investment
```

## Data Model
All data lives in `localStorage` under key `finance_manager_data` as `AppState`:
- `monthlyExpenses` — id, name, amount, category, date
- `educationExpenses` — id, name, amount, type, date
- `incomes` — id, source/client, type, amount, date
- `investments` — id, year, date, amount, description

## Key Conventions
- All pages are Czech language
- `useStore()` hook for accessing/mutating state
- `useAuth()` hook for auth state
- Currency formatted in CZK
- Data persists across sessions via localStorage
