# Claro — Frontend Implementation Plan

Stack: React 18 · Redux Toolkit · React Router v6 · Material UI · Recharts · Axios  
Package manager: pnpm  
Build tool: Vite

---

## Before You Write a Single Line

The frontend lives at `apps/web`. Don't start it until the backend has at least Phase 1–2 done — you need a working auth API to wire up the login flow, and there's no point building UI against a non-existent API.

```
apps/web/
├── src/
│   ├── pages/
│   ├── components/
│   ├── store/
│   ├── services/
│   ├── hooks/
│   └── main.tsx
├── index.html
├── vite.config.ts
└── package.json
```

---

## Phase 1 — Project Scaffold

**Goal:** Vite dev server runs. MUI theme is configured. React Router is set up. Redux store exists.

### Step 1.1 — Bootstrap

```bash
cd apps
pnpm create vite web --template react-ts
cd web
# Set "name": "web" in package.json — that's what --filter web matches
```

Install from the repo root (not from inside web/):
```bash
cd ../../
pnpm install
```

### Step 1.2 — Install dependencies

```bash
# UI
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled

# Routing
pnpm add react-router-dom

# State management
pnpm add @reduxjs/toolkit react-redux

# HTTP
pnpm add axios

# Charts
pnpm add recharts

# CSV export
pnpm add file-saver
pnpm add -D @types/file-saver

# Form validation
pnpm add react-hook-form @hookform/resolvers zod
```

### Step 1.3 — Vite config

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

The proxy means you call `/api/v1/auth/login` from the frontend — no hardcoded localhost URLs in your code, no CORS issues in development.

### Step 1.4 — MUI Theme

Claro's palette is a deep navy-to-blue spectrum. The darkest tone (`#001d64`) is the primary — it reads as authoritative and financial, not playful. The lighter blues (`#006abc`, `#0098f1`) are used for interactive elements, highlights, and gradients. The app ships with both light and dark mode from day one.

```
Claro colour palette:
#001d64  — Navy (primary, darkest)
#002473  — Dark blue
#003083  — Mid navy
#006abc  — Accent blue (links, icons, chips)
#0098f1  — Sky blue (hover states, highlights)
```

Create `src/theme/index.ts` — export both themes and a hook to switch between them:

```typescript
// src/theme/index.ts
import { createTheme, Theme } from '@mui/material/styles';

const CLARO_PALETTE = {
  navy:      '#001d64',
  darkBlue:  '#002473',
  midNavy:   '#003083',
  accentBlue:'#006abc',
  skyBlue:   '#0098f1',
};

// Shared shape/typography tokens — same in both modes
const sharedTokens = {
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 600,
          borderRadius: 8,
        },
        containedPrimary: {
          // Gradient on primary buttons — the main CTA style
          background: `linear-gradient(135deg, ${CLARO_PALETTE.midNavy} 0%, ${CLARO_PALETTE.accentBlue} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${CLARO_PALETTE.darkBlue} 0%, ${CLARO_PALETTE.skyBlue} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
};

export const lightTheme: Theme = createTheme({
  ...sharedTokens,
  palette: {
    mode: 'light',
    primary: {
      main: CLARO_PALETTE.navy,
      light: CLARO_PALETTE.accentBlue,
      dark: CLARO_PALETTE.navy,
      contrastText: '#ffffff',
    },
    secondary: {
      main: CLARO_PALETTE.accentBlue,
      light: CLARO_PALETTE.skyBlue,
    },
    background: {
      default: '#F0F4FF',   // very faint blue tint — not pure white
      paper: '#ffffff',
    },
    text: {
      primary: '#0D1B3E',   // near-black with a blue undertone
      secondary: '#4A5878',
    },
  },
});

export const darkTheme: Theme = createTheme({
  ...sharedTokens,
  palette: {
    mode: 'dark',
    primary: {
      main: CLARO_PALETTE.accentBlue,    // shift to brighter blue in dark mode — navy is invisible on dark bg
      light: CLARO_PALETTE.skyBlue,
      dark: CLARO_PALETTE.midNavy,
      contrastText: '#ffffff',
    },
    secondary: {
      main: CLARO_PALETTE.skyBlue,
    },
    background: {
      default: '#0A0F1E',   // near-black with a navy undertone — not pure black
      paper: '#111827',     // slightly lighter — cards sit above the page bg
    },
    text: {
      primary: '#E8EEFF',
      secondary: '#8B9CC8',
    },
  },
  components: {
    ...sharedTokens.components,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0, 106, 188, 0.15)', // subtle blue border in dark mode
        },
      },
    },
  },
});
```

**Why this palette works:**
- `#001d64` as primary in light mode has enough contrast against white to pass WCAG AA on text
- In dark mode, `#001d64` on a dark background is unreadable — so shift primary to `#006abc` which is bright enough to pop
- The `#F0F4FF` background (light mode) is better than pure white — it makes the navy feel intentional rather than dropped in
- The gradient on buttons (`#003083 → #006abc`) is subtle enough to be professional, not garish. It gives buttons visual weight without needing a thick shadow
- Dark mode background `#0A0F1E` has a navy undertone that ties it to the palette — pure black (#000) would feel disconnected

**Where gradients are appropriate:**
- Primary action buttons (Submit, Import, Create Budget)
- The sidebar header / logo area
- Dashboard summary cards — a very subtle gradient overlay on the card background
- Chart colors can use the palette linearly: `[#001d64, #002473, #003083, #006abc, #0098f1]`

**Where gradients are NOT appropriate:**
- Table rows, form fields, chips, badges — keep those flat. Gradients everywhere is amateur hour.

### Step 1.5 — Theme switching (Redux + localStorage)

Store the user's preference in Redux and persist it to localStorage:

```typescript
// src/store/slices/themeSlice.ts
type ThemeMode = 'light' | 'dark';

const getInitialMode = (): ThemeMode => {
  const stored = localStorage.getItem('claro-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  // Respect OS preference on first visit
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: getInitialMode() } as { mode: ThemeMode },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('claro-theme', state.mode);
    },
  },
});
```

In `main.tsx`, select the right theme object based on Redux state:

```tsx
function ThemedApp() {
  const mode = useAppSelector(state => state.theme.mode);
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}
```

`<CssBaseline />` is critical — it applies MUI's CSS reset and sets the body background to `theme.palette.background.default` automatically. This is how dark mode flips the page background without any manual CSS.

The toggle button goes in the TopNav — a sun/moon icon that dispatches `toggleTheme()`. One component, one line, done.

### Step 1.5 — App structure

```tsx
// main.tsx
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ThemedApp />   {/* ThemedApp reads theme mode from Redux, picks light or dark theme */}
    </BrowserRouter>
  </Provider>
);
```

```tsx
// App.tsx
function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
}
```

`ProtectedLayout` is a component that checks if the user is authenticated. If not, redirects to `/login`. It also renders the top nav and sidebar that wrap all protected pages.

---

## Phase 2 — Auth Flow

**Goal:** Register, login, token storage, silent refresh, logout.

### Token storage strategy

Store the `accessToken` in memory (Redux state) — never in localStorage. Store the `refreshToken` in an httpOnly cookie if the backend supports it, or in localStorage as a fallback.

For this project, localStorage for the refresh token is acceptable given the scope. Just be aware of the tradeoff — XSS can steal it. If you want to be more secure, configure the backend to send the refresh token as an httpOnly cookie.

### Redux slice

```typescript
// src/store/slices/authSlice.ts
interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string } | null;
  isInitialized: boolean; // true once we've checked for an existing session
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { accessToken: null, user: null, isInitialized: false } as AuthState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user: any }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});
```

### Axios instance with interceptors

```typescript
// src/services/api.ts
const api = axios.create({ baseURL: '/api/v1' });

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
        localStorage.setItem('refreshToken', data.refreshToken);
        store.dispatch(setCredentials({ accessToken: data.accessToken, user: store.getState().auth.user }));
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        store.dispatch(clearCredentials());
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);
```

This interceptor silently refreshes the token on 401 and retries the original request. The user never sees the token expiry.

### Session init on app load

On startup, check if a refresh token exists in localStorage and silently exchange it for a new access token:

```typescript
// src/hooks/useInitAuth.ts
export function useInitAuth() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });
          localStorage.setItem('refreshToken', data.refreshToken);
          const user = await api.get('/users/me');
          dispatch(setCredentials({ accessToken: data.accessToken, user: user.data }));
        } catch {
          localStorage.removeItem('refreshToken');
        }
      }
      dispatch(setInitialized());
    };
    init();
  }, []);
}
```

Call this in `App.tsx`. While `isInitialized` is false, show a full-screen loader. This prevents the flicker where the app briefly shows the login page before realising the user is already logged in.

### ProtectedLayout

```tsx
function ProtectedLayout() {
  const { accessToken, isInitialized } = useAppSelector(state => state.auth);

  if (!isInitialized) return <FullScreenLoader />;
  if (!accessToken) return <Navigate to="/login" replace />;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <TopNav />
        <Outlet />
      </Box>
    </Box>
  );
}
```

### Auth pages

**LoginPage** and **RegisterPage** are simple form pages. Use `react-hook-form` + `zod` for validation:

```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
});
```

Both pages redirect to `/` on success. If the user is already authenticated and hits `/login`, redirect them to `/`.

---

## Phase 3 — Layout & Navigation

**Goal:** Persistent sidebar and topnav. All pages have consistent layout.

### Sidebar

Fixed left sidebar, 240px wide. Links to all main sections. Highlights active route.

```tsx
const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Transactions', path: '/transactions', icon: <ReceiptIcon /> },
  { label: 'Budgets', path: '/budgets', icon: <AccountBalanceWalletIcon /> },
  { label: 'Accounts', path: '/accounts', icon: <AccountBalanceIcon /> },
  { label: 'Import', path: '/import', icon: <UploadIcon /> },
  { label: 'Notifications', path: '/notifications', icon: <NotificationsIcon /> },
];
```

Use `useLocation()` to determine the active route and apply the active style.

### TopNav

Right side: user email + logout button. Left side: page title (use a context or derive from current route).

Notification bell icon with a badge showing unread count — this requires a `GET /notifications` call to get the count. Poll every 30 seconds or just fetch on page load.

---

## Phase 4 — Dashboard Page

**Goal:** Summary cards, spending pie chart, monthly trend bar chart.

### API calls

```typescript
// src/services/dashboardService.ts
export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data);
export const getSpendingByCategory = (month: string) =>
  api.get(`/dashboard/spending-by-category?month=${month}`).then(r => r.data);
export const getMonthlyTrend = (months = 6) =>
  api.get(`/dashboard/monthly-trend?months=${months}`).then(r => r.data);
```

### Redux slice or local state

For dashboard data, local component state with `useEffect` is fine. You don't need Redux for every API call — Redux is for shared state (auth, notifications). Page-level data can live in the component.

```typescript
const [summary, setSummary] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  Promise.all([
    getDashboardSummary(),
    getSpendingByCategory(currentMonth),
    getMonthlyTrend(6),
  ]).then(([summary, spending, trend]) => {
    setSummary(summary);
    setSpending(spending);
    setTrend(trend);
    setLoading(false);
  });
}, []);
```

### Summary cards

Four cards in a row (2-column grid on mobile):

| Card | Value |
|------|-------|
| Total Balance | `PKR 142,000` |
| Monthly Income | `PKR 85,000` |
| Monthly Expenses | `PKR 48,000` |
| Savings Rate | `44%` |

Format currency with `Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' })`.

### Spending by category — Pie chart

Use Recharts `PieChart`:

```tsx
<PieChart width={400} height={300}>
  <Pie
    data={spending}
    dataKey="amount"
    nameKey="category"
    cx="50%"
    cy="50%"
    outerRadius={120}
    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
  >
    {spending.map((_, i) => (
      <Cell key={i} fill={COLORS[i % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(value) => `PKR ${Number(value).toLocaleString()}`} />
</PieChart>
```

Use the Claro palette as the base, then extend with neutrals for categories beyond 5:
```typescript
const CHART_COLORS = [
  '#001d64',
  '#002473',
  '#002d7d',
  '#003083',
  '#003d96',
  '#004aad',
  '#005bbf',
  '#006abc',
  '#0082d8',
  '#0098f1',
];
```

### Monthly trend — Bar chart

```tsx
<BarChart width={600} height={300} data={trend}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="month" />
  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
  <Tooltip formatter={(v) => `PKR ${Number(v).toLocaleString()}`} />
  <Legend />
  <Bar dataKey="income" fill="#0098f1" name="Income" />
  <Bar dataKey="expenses" fill="#003083" name="Expenses" />
</BarChart>
```

---

## Phase 5 — Transactions Page

**Goal:** Paginated, filterable transaction list. Category correction. CSV export.

### Filters

Filter bar at the top with:
- Account dropdown (populated from `GET /accounts`)
- Category dropdown (hardcoded list from the category map)
- Date range pickers (MUI `DatePicker` from `@mui/x-date-pickers`)
- Search (description contains — add this query param to the backend if you want it)

Filters are kept in local state. When any filter changes, reset page to 1 and refetch.

### Transaction list

Use MUI `DataGrid` or a plain `Table`. DataGrid is more work to set up but gives you built-in sorting. A plain table is faster to build.

Each row:
- Date
- Description (truncated to ~40 chars with tooltip on hover)
- Amount — green if income, red if expense
- Category — shown as a chip, clickable to edit
- Account name

### Category correction

Click the category chip → opens a small `Popover` or inline `Select` with the category list → on change, call `PATCH /transactions/:id` → update the row in place without re-fetching the whole list.

```typescript
const handleCategoryChange = async (transactionId: string, newCategory: string) => {
  await api.patch(`/transactions/${transactionId}`, { category: newCategory });
  setTransactions(prev =>
    prev.map(t => t.id === transactionId ? { ...t, category: newCategory } : t)
  );
};
```

### Pagination

MUI `TablePagination` component. Pass `total`, `page`, and `rowsPerPage` from API response.

### CSV export

Export button calls `GET /transactions/export/csv` with the current active filters as query params. Use the `file-saver` library:

```typescript
const handleExport = async () => {
  const params = buildQueryParams(filters);
  const response = await api.get(`/transactions/export/csv?${params}`, {
    responseType: 'blob',
  });
  saveAs(response.data, 'transactions.csv');
};
```

---

## Phase 6 — Budgets Page

**Goal:** Create budgets, view usage, visual progress bars.

### Budget card

Each budget is a card with:
- Category name and month
- Progress bar — MUI `LinearProgress` with custom color based on status
- `PKR X,XXX / PKR XX,XXX (XX%)`
- Status chip: green "OK", amber "Warning", red "Exceeded"

```tsx
const statusColor = {
  ok: 'success',
  warning: 'warning',
  exceeded: 'error',
};

<LinearProgress
  variant="determinate"
  value={Math.min(budget.percentage, 100)}
  color={statusColor[budget.status]}
  sx={{ height: 8, borderRadius: 4 }}
/>
```

### Create budget dialog

"Add Budget" button opens a `Dialog`:
- Category select (dropdown)
- Month picker (`<input type="month">` or MUI DatePicker in month mode)
- Limit amount input

On submit, call `POST /budgets`. On 409 (duplicate), show an inline error: "You already have a food budget for May 2026."

### Update and delete

Each budget card has an edit icon (change the limit) and a delete icon (soft delete). Delete shows a confirmation dialog before calling `DELETE /budgets/:id`.

---

## Phase 7 — Accounts Page

**Goal:** List accounts, create new account.

### Account card

```
┌─────────────────────────────┐
│  HBL                        │
│  Current Account            │
│  Balance: PKR 142,000       │
│  Last import: May 19, 2026  │
└─────────────────────────────┘
```

### Create account

A `Dialog` with:
- Bank name dropdown (HBL, UBL, Meezan, other)
- Account name text input
- Account type select (current, savings, credit)

---

## Phase 8 — CSV Import Page

**Goal:** File upload with drag-and-drop, account selection, import result display.

### Import form

```
┌─────────────────────────────────────┐
│  Select Account                     │
│  [dropdown: My HBL Account ▼]       │
│                                     │
│  Upload Statement                   │
│  ┌─────────────────────────────┐   │
│  │  Drag & drop CSV here       │   │
│  │  or click to browse         │   │
│  └─────────────────────────────┘   │
│                                     │
│           [Import]                  │
└─────────────────────────────────────┘
```

Use the browser's native `<input type="file">` styled with MUI, or a lightweight drag-and-drop library.

### Import result

After a successful import, replace the form with a result card:

```
✓ Import complete

120  total rows
98   imported
22   skipped (duplicates)
```

If the import fails (wrong file type, too large, unrecognised bank), show a clear error message — not a generic "something went wrong."

### Import history

Below the upload form, a table showing past imports:

| Bank | File | Imported | Date |
|------|------|----------|------|
| HBL | statement-may.csv | 98 | May 19, 2026 |

Each row has a delete button. Delete calls `DELETE /csv-import/history/:id` and removes the row from the list.

---

## Phase 9 — Notifications Page

**Goal:** List notifications, mark as read, delete.

### Notification list

Unread notifications have a highlighted background. Read ones are muted.

Each item:
- Icon based on type (warning triangle for budget_warning, red circle for budget_exceeded)
- Message text
- Relative time ("2 hours ago" — use `Intl.RelativeTimeFormat` or a simple utility function)
- Mark as read button (if unread)
- Delete button

### Bulk actions

"Mark all as read" button at the top — calls `PATCH /notifications/read-all`. Clears the notification badge in the TopNav.

---

## Component Conventions

Keep these consistent throughout the project:

**Folder structure per page:**
```
src/pages/Dashboard/
├── DashboardPage.tsx      ← page component, handles data fetching
└── components/
    ├── SummaryCard.tsx
    ├── SpendingChart.tsx
    └── TrendChart.tsx
```

**Data fetching:** Fetch in the page component, not in sub-components. Pass data down as props. This makes it easy to see exactly what data each page needs.

**Error states:** Every page that fetches data needs three states: loading, error, and data. Use a consistent pattern:
```tsx
if (loading) return <CircularProgress />;
if (error) return <Alert severity="error">{error.message}</Alert>;
return <ActualContent data={data} />;
```

**Form errors:** Always show API errors near the form submit button, not in a toast. Toasts are for non-critical feedback (e.g. "Category updated"). Errors that block the user need to be inline.

**Currency formatting:** Create a utility function once, use it everywhere:
```typescript
export const formatPKR = (amount: number): string =>
  new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR' }).format(amount);
```

---

---

## Shared Packages

### `@claro/types`

Create this first — before either app. It holds the TypeScript interfaces shared between frontend and backend so you're never duplicating type definitions.

```
packages/types/
├── src/
│   ├── user.types.ts
│   ├── transaction.types.ts
│   ├── budget.types.ts
│   ├── account.types.ts
│   ├── notification.types.ts
│   ├── dashboard.types.ts
│   └── index.ts
└── package.json
```

**package.json:**
```json
{
  "name": "@claro/types",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

No build step needed — TypeScript resolves the source directly via path aliases in tsconfig.

Example types:
```typescript
// transaction.types.ts
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  accountId: string;
}

export interface TransactionFilters {
  accountId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
```

Import in the frontend:
```typescript
import type { Transaction, Budget, ApiResponse } from '@claro/types';
```

Import in the backend (NestJS DTOs can extend these):
```typescript
import type { Transaction } from '@claro/types';
```

### `@claro/ui` — Shared Component Library + Storybook

Reusable MUI-based components that both exist now and grow over time. Build components here first, test in Storybook, then consume in `apps/web`.

```
packages/ui/
├── src/
│   ├── components/
│   │   ├── StatCard/
│   │   │   ├── StatCard.tsx
│   │   │   └── StatCard.stories.tsx
│   │   ├── BudgetCard/
│   │   │   ├── BudgetCard.tsx
│   │   │   └── BudgetCard.stories.tsx
│   │   ├── TransactionRow/
│   │   │   ├── TransactionRow.tsx
│   │   │   └── TransactionRow.stories.tsx
│   │   └── StatusChip/
│   │       ├── StatusChip.tsx
│   │       └── StatusChip.stories.tsx
│   └── index.ts
├── .storybook/
│   ├── main.ts
│   └── preview.ts
└── package.json
```

**package.json:**
```json
{
  "name": "@claro/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

**Install Storybook in `packages/ui`:**
```bash
cd packages/ui
pnpm dlx storybook@latest init --type react
pnpm add -D @storybook/react @storybook/addon-essentials @storybook/react-vite
```

**Storybook preview.ts** — wrap stories with Claro's MUI theme so they render correctly:
```typescript
// .storybook/preview.ts
import { ThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme } from '../src/theme';

export const decorators = [
  (Story) => (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Story />
    </ThemeProvider>
  ),
];
```

Example component:
```typescript
// src/components/StatCard/StatCard.tsx
interface StatCardProps {
  label: string;
  value: string;
  trend?: number; // positive = up, negative = down
}

export function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="h5" fontWeight={700} mt={1}>{value}</Typography>
      {trend !== undefined && (
        <Typography
          variant="caption"
          color={trend >= 0 ? 'success.main' : 'error.main'}
        >
          {trend >= 0 ? '+' : ''}{trend}% vs last month
        </Typography>
      )}
    </Card>
  );
}
```

Example story:
```typescript
// src/components/StatCard/StatCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  component: StatCard,
  title: 'Components/StatCard',
};
export default meta;

export const Default: StoryObj<typeof StatCard> = {
  args: { label: 'Monthly Income', value: 'PKR 85,000', trend: 12 },
};

export const Negative: StoryObj<typeof StatCard> = {
  args: { label: 'Monthly Expenses', value: 'PKR 48,000', trend: -5 },
};
```

Import in `apps/web`:
```typescript
import { StatCard, BudgetCard, StatusChip } from '@claro/ui';
```

### `@claro/tsconfig`

```
packages/tsconfig/
├── base.json
├── react.json
└── nestjs.json
```

```json
// base.json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}

// react.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx"
  }
}

// nestjs.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist"
  }
}
```

Each app extends these — e.g. `apps/web/tsconfig.json`:
```json
{
  "extends": "@claro/tsconfig/react.json",
  "include": ["src"]
}
```

### `@claro/eslint-config`

```
packages/eslint-config/
├── base.js
├── react.js
└── nestjs.js
```

```javascript
// base.js — ESLint 9 flat config
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
```

Each app's `eslint.config.js` extends the relevant config:
```javascript
// apps/web/eslint.config.js
import baseConfig from '@claro/eslint-config/react';
export default [...baseConfig];
```

### Husky + lint-staged

Set up from the repo root after `pnpm install`:

```bash
pnpm dlx husky init
```

`.husky/pre-commit`:
```bash
pnpm lint-staged
```

Root `package.json` — add lint-staged config:
```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

The commit is blocked if ESLint errors exist after auto-fix or if Prettier finds unfixable issues. This keeps the codebase consistent without relying on anyone remembering to run lint manually.

---

## Things to Add Later (Not MVP)

- Mobile responsiveness — the sidebar collapses to a hamburger menu on small screens. MUI's `Drawer` component handles this. Leave it for after the desktop layout is solid.
- Date range presets — "This month", "Last month", "Last 3 months" quick filters on the transactions page.
- Account balance history — track balance over time so you can chart it. Requires a new DB table. Out of scope for v1.
- Category rules — let users define their own keyword → category mappings. Stored per user in the DB. The current categoriser reads from a hardcoded map; this would just make that map user-configurable.
- Recharts responsiveness — wrap all charts in `<ResponsiveContainer width="100%" height={300}>` for proper resize behavior on different screen widths. Do this from the start actually — don't skip it.

**Already in MVP (not "later"):**
- Dark / light mode toggle — implemented in Phase 1 with the theme system above
- TypeORM migrations — implemented in backend Phase 1

---

## Implementation Order Summary

| Week | Section | Key Deliverable |
|------|---------|----------------|
| 1 (after backend Phase 1-2) | Scaffold + Auth | Vite up, login/register works, token refresh works, dark/light toggle in nav |
| 1 | Layout | Sidebar, topnav, protected routes |
| 2 | Dashboard | Summary cards, pie chart, trend chart |
| 2 | Accounts | List accounts, create account |
| 3 | CSV Import | Upload flow, result display, import history |
| 3 | Transactions | List with filters, pagination, category edit |
| 4 | Budgets | Budget cards, progress bars, create/edit/delete |
| 4 | Notifications | Notification list, mark as read, badge in nav |
| 5 | Polish | Error states, loading states, empty states, mobile pass |
