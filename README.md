# Credit Card Tracker

A modern, mobile-first web application for tracking credit card expenses, managing statement cycles, and visualizing spending analytics. Built with Next.js, Radix UI, TanStack Query, and TypeScript.

## 🚀 Features
- Responsive mobile navigation with accessible dialogs and sheets
- Add, edit, and delete transactions and cards
- Category and card management
- Spending analytics with charts
- Toast notifications for CRUD actions
- Local storage and database support

## 🛠️ Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation
```bash
git clone <your-repo-url>
cd credit-card-tracker
npm install # or yarn install
```

### Running Locally
```bash
npm run dev # or yarn dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Environment Variables
Create a `.env.local` file for secrets and config. Example:
```
# Example
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## 📦 Deployment
- Deploy on Vercel, Netlify, or any Next.js-compatible platform.
- For Sentry error monitoring:
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard -i nextjs
  ```
  Follow the prompts to complete setup.

## 📊 Schema Documentation
### Cards Table
| Column    | Type    | Description           |
|-----------|---------|----------------------|
| id        | string  | Primary key          |
| name      | string  | Card name            |
| statementDay | number | Statement day        |
| dueDay    | number  | Due day              |
| currency  | string  | Currency             |
| createdAt | string  | Creation date        |
| updatedAt | string  | Last update date     |

### Transactions Table
| Column      | Type    | Description           |
|-------------|---------|----------------------|
| id          | string  | Primary key          |
| description | string  | Transaction details  |
| amount      | number  | Amount spent         |
| currency    | string  | Currency             |
| cardId      | string  | Linked card ID       |
| categoryId  | string  | Linked category ID   |
| date        | string  | Transaction date     |
| createdAt   | string  | Creation date        |
| updatedAt   | string  | Last update date     |

### Categories Table
| Column      | Type    | Description           |
|-------------|---------|----------------------|
| id          | string  | Primary key          |
| name        | string  | Category name        |
| createdAt   | string  | Creation date        |
| updatedAt   | string  | Last update date     |

## 🚧 Known Issues & Limitations
- Radix Select inside Dialog triggers a devtools accessibility warning (does not impact users)
- No multi-user support yet
- Local storage fallback may not sync across devices
- Dialogs may not work well with screen readers

## 🧪 Testing & Auditing
- Run `npm audit` or `yarn audit` to check for vulnerabilities
- Use Chrome DevTools Performance tab to monitor for memory leaks
- Error monitoring: Sentry or LogRocket recommended

## 🤝 Contributing
PRs welcome! Please open issues for bugs or feature requests.

---
MIT License
