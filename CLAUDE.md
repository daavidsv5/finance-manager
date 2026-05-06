@AGENTS.md

# Finance Manager — Project Overview

## Stack
- **Framework:** Next.js 16.2.3 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui + @base-ui/react
- **Tables:** @tanstack/react-table v8
- **Charts:** recharts v3 (BarChart, Cell)
- **Icons:** lucide-react
- **State:** React Context API + localStorage (no backend)

## Deployment
- **GitHub:** https://github.com/daavidsv5/finance-manager (branch: `main`)
- **Vercel:** připojit přes vercel.com → Import Git Repository → auto-deploy na každý push

## Auth
- Mock login, credentials: `david@finance.cz` / `David2026!`
- Auth state uložen v localStorage pod klíčem `finance_manager_auth`

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
│       ├── income/page.tsx         # Income (nejkomplexnější stránka)
│       └── investments/page.tsx    # Investments
├── components/
│   ├── ui/                         # Shared UI primitives (button, input, select, dialog…)
│   ├── data-table/                 # TanStack Table wrappers
│   ├── forms/                      # Add-record forms
│   ├── widgets/SummaryCard.tsx     # KPI karty
│   └── layout/Sidebar.tsx
├── lib/
│   ├── store.tsx                   # Context + localStorage
│   ├── auth.tsx                    # Mock auth provider
│   ├── initialData.ts              # Seed data
│   ├── format.ts                   # formatCzk()
│   └── utils.ts
└── types/index.ts                  # AppState, MonthlyExpense, EducationExpense, Income, Investment
```

## Data Model
Vše v `localStorage` pod klíčem `finance_manager_data` jako `AppState`:
- `monthlyExpenses` — id, name, category, amount, date
- `educationExpenses` — id, name, type, paidBy, amount, date
- `incomes` — id, year, month, client, amount, type ('Příjem'|'Výdej'), invoiceSent?, paid?
- `investments` — id, year, date, amount, description, type

## Store API (`useStore()`)
- `addMonthlyExpense / addEducationExpense / addIncome / addInvestment`
- `deleteMonthlyExpense / deleteEducationExpense / deleteIncome / deleteInvestment`
- `updateMonthlyExpense(id, Partial<MonthlyExpense>)` — pro editaci existující položky
- `updateIncome(id, Partial<Income>)` — pro toggle invoiceSent / paid

## Income page — klíčové detaily
- **Roční graf** (nahoře) — čistý příjem per rok, klik na sloupec filtruje měsíční graf + KPI; barva tmavě zelená (`#16a34a`), vybraný rok `#14532d`
- **Měsíční graf** (pod ročním) — čistý příjem per měsíc pro vybraný rok; barva tmavě modrá (`#1e3a8a`)
- **KPI karty** synchronizovány s výběrem roku v grafu (`chartYear` state)
- **Čistý příjem** = příjmy (type='Příjem') − daně (type='Výdej')
- **Faktura poslána / Zaplaceno** — klikatelné checkboxy přímo v tabulce (volají `updateIncome`)
- Výdeje typu 'Výdej' nemají checkbox pro fakturu/zaplacení (zobrazí se `—`)

## David investice — klíčové detaily
- Přejmenováno z "Investice" → "David investice" (sidebar + nadpis stránky)
- Sloupce tabulky: Rok, Datum, Broker, Částka (Popis odstraněn)
- Broker = pole `type` v Investment modelu; hodnoty: `Etoro`, `XTB` (+ ETF, Akcie…)
- Seed data: 32 záznamů od dubna 2024 do dubna 2026 (Etoro 2024, XTB od 12/2024)
- Po změně seed dat je nutné smazat `finance_manager_data` z localStorage

## Děti investice — klíčové detaily
- Stránka: `/dashboard/children-investments` (route), sidebar ikona `Baby`
- Data uložena v `AppState.childrenInvestments` (oddělené od `investments`)
- Store API: `addChildInvestment / deleteChildInvestment` (prefix id: `cinv-`)
- Sloupce tabulky: Rok, Datum, Typ, Částka
- Typy: `Spoření`, ETF, Akcie, Dluhopisy, Ostatní (výchozí: Spoření)
- Seed data: 7 záznamů od srpna 2025 do dubna 2026

## Konvence
- Vše česky
- `useStore()` / `useAuth()` hooks
- Měna: `formatCzk()` → CZK
- KPI box "Zobrazeno" byl odstraněn ze všech sekcí (monthly, education, investments)
