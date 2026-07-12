# AssetFlow – Enterprise Asset & Resource Management System
### React Frontend — Hackathon Ready

---

## 🚀 Quick Start

```bash
cd assetflow-frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo credentials** (no real auth yet):
- Email: `admin@assetflow.com`
- Password: `any password`

---

## 📁 Project Structure

```
src/
├── components/common/     # Button, Input, Select, Modal, Badge, Card, DataTable, SearchBar, Pagination, Toast
├── context/               # AuthContext, ToastContext
├── constants/             # routes.js, apiEndpoints.js, mockData.js
├── layouts/               # AuthLayout, MainLayout, Sidebar
├── pages/
│   ├── auth/              # LoginPage, RegisterPage
│   ├── DashboardPage
│   ├── OrganizationSetupPage
│   ├── AssetsPage
│   ├── AllocationPage
│   ├── ResourceBookingPage
│   ├── MaintenancePage
│   ├── AuditPage
│   ├── ReportsPage
│   └── NotificationsPage
├── routes/                # AppRouter, ProtectedRoute
├── services/              # api.js (Axios), authService.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🔌 Connecting to ASP.NET Core 8 Backend

### 1. Update `.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Dev Proxy (`vite.config.js` — already configured)
```js
proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } }
```

### 3. Swap Mock → Real API

Each service file has labelled placeholder blocks:
```js
// Remove mock block, uncomment real API:
const { data } = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);
localStorage.setItem('af_token', data.token);
```

### 4. Expected Response Conventions

| Pattern | Format |
|---------|--------|
| GET list | `{ data: [...], total: 100 }` |
| POST create | `{ id, ...obj }` |
| Error | `{ message: "...", errors: {} }` |
| Auth | `Authorization: Bearer <jwt>` |

---

## 📦 Tech Stack

| Package | Purpose |
|---------|---------|
| React 18 | UI library |
| React Router DOM 6 | Client-side routing |
| Axios | HTTP client |
| Tailwind CSS 3 | Utility CSS |
| Recharts | Charts |
| React Icons | Icon library (HeroIcons) |
| clsx | Conditional classnames |

---

## 🗺 Pages Map

| Route | Page | Role |
|-------|------|------|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/` | Dashboard | All |
| `/organization` | Org Setup | Admin only |
| `/assets` | Asset Directory | All |
| `/allocation` | Allocation & Transfer | All |
| `/booking` | Resource Booking | All |
| `/maintenance` | Maintenance Kanban | All |
| `/audit` | Audit Log | Admin only |
| `/reports` | Reports | All |
| `/notifications` | Notifications | All |

---

## ✅ Key Features

- Dark enterprise theme with Inter font
- Responsive with collapsible sidebar
- Role-based access (Admin vs Employee)
- JWT-ready auth architecture
- Global toast notifications
- Double-allocation blocking (Screen 5)
- Kanban board 5-stage workflow (Screen 7)
- Booking conflict detection (Screen 6)
- Recharts area/bar/pie charts
- Paginated, filterable tables
- Modal forms with validation
- All API endpoints pre-defined

*Built for hackathon – AssetFlow 2026*
