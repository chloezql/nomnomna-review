# nomnomna-review

A monorepo containing three apps for the nomnomna restaurant review platform.

## Structure

| Directory  | Description                          | Stack                  |
|------------|--------------------------------------|------------------------|
| `backend/` | REST API and WebSocket server        | Node.js, Express, Supabase, OpenAI |
| `business/`| Dashboard for restaurant owners      | React, Vite, Tailwind  |
| `customer/`| Customer-facing review interface     | React, Vite, Tailwind  |

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

### Business App

```bash
cd business
npm install
npm run dev
```

### Customer App

```bash
cd customer
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in `backend/` with the required credentials (Supabase, OpenAI, etc.).
