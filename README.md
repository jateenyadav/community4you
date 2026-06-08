# Community4You

A full-stack platform to **discover, create, and grow communities**. Browse a directory of communities, join the ones you like, post to their feeds, and manage everything from a personal dashboard.

Built as a clean monorepo: a **Node + Express + SQLite** REST API and a **React (Vite)** single-page client, sharing a single `npm run dev` workflow.

---

## Features

- **Authentication** — register, log in, JWT-based sessions, persisted profile (name, bio, avatar).
- **Community directory** — search, filter by category, and sort the full list of communities.
- **Community pages** — detail view with cover, description, member list, and a live post feed.
- **Membership** — join / leave communities; owners can't leave their own.
- **Posts** — members can post to a community feed; authors and owners can delete posts.
- **Ownership controls** — owners can edit and delete their communities.
- **Dashboard** — see the communities you own and have joined, and edit your profile in place.
- **Modern UI** — responsive dark theme, debounced search, loading states, and empty states.

---

## Tech stack

| Layer       | Technology                                                        |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | React 18, React Router, Vite, Context API, hand-written CSS       |
| Backend     | Node.js, Express, JWT (`jsonwebtoken`), `bcryptjs`, `cors`        |
| Database    | SQLite via `better-sqlite3` (repository pattern)                  |
| Tooling     | `concurrently`, `dotenv`, ES modules                              |

---

## Project structure

```
community4you/
├── client/                 # React (Vite) SPA
│   ├── src/
│   │   ├── components/      # Navbar, Footer, CommunityCard, Spinner, ProtectedRoute
│   │   ├── context/         # AuthContext
│   │   ├── lib/             # api.js — centralized fetch client
│   │   ├── pages/           # Explore, CommunityDetail, CreateCommunity, Dashboard, Login, Register, NotFound
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── vite.config.js
├── server/                 # Express REST API
│   ├── src/
│   │   ├── middleware/      # auth.js (JWT verify + sign)
│   │   ├── repositories/    # users, communities, posts (data access)
│   │   ├── routes/          # auth, communities, me
│   │   ├── db.js            # SQLite connection + schema
│   │   ├── seed.js          # sample data
│   │   └── index.js         # app entry
│   └── .env.example
├── package.json            # root scripts (concurrently)
└── .gitignore
```

---

## Getting started

### Prerequisites

- Node.js **18+**

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure the server environment

```bash
cp server/.env.example server/.env
```

Then set a strong `JWT_SECRET` in `server/.env`:

```env
PORT=4000
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
```

### 3. Seed the database (optional but recommended)

```bash
npm run seed
```

This creates sample communities and a demo account:

- **Email:** `demo@community4you.dev`
- **Password:** `demo1234`

### 4. Run in development

```bash
npm run dev
```

- Client → http://localhost:3000
- API → http://localhost:4000

The Vite dev server proxies `/api` requests to the Express server.

---

## Production build

```bash
npm run build   # builds the client into client/dist
npm start       # serves the API; also serves client/dist if present
```

When `client/dist` exists, the Express server serves the SPA and falls back to `index.html` for client-side routes.

---

## API reference

Base URL: `http://localhost:4000`

### Auth

| Method | Endpoint             | Auth | Description                          |
| ------ | -------------------- | ---- | ------------------------------------ |
| POST   | `/api/auth/register` | —    | Create an account, returns user+token |
| POST   | `/api/auth/login`    | —    | Log in, returns user+token            |
| GET    | `/api/auth/me`       | ✓    | Current user                          |
| PATCH  | `/api/auth/me`       | ✓    | Update name / bio / avatar            |

### Communities

| Method | Endpoint                                  | Auth | Description                         |
| ------ | ----------------------------------------- | ---- | ----------------------------------- |
| GET    | `/api/communities?search=&category=&sort=`| —    | List with filters                   |
| GET    | `/api/communities/categories`             | —    | Distinct categories                 |
| POST   | `/api/communities`                        | ✓    | Create a community                  |
| GET    | `/api/communities/:slug`                  | opt  | Detail + members + posts            |
| PATCH  | `/api/communities/:slug`                  | ✓ owner | Update a community               |
| DELETE | `/api/communities/:slug`                  | ✓ owner | Delete a community               |
| POST   | `/api/communities/:slug/join`             | ✓    | Join                                |
| DELETE | `/api/communities/:slug/join`             | ✓    | Leave                               |
| POST   | `/api/communities/:slug/posts`            | ✓ member | Create a post                    |
| DELETE | `/api/communities/:slug/posts/:postId`    | ✓ author/owner | Delete a post              |

### Me

| Method | Endpoint              | Auth | Description                          |
| ------ | --------------------- | ---- | ------------------------------------ |
| GET    | `/api/me/communities` | ✓    | Communities you own and have joined  |

### Health

| Method | Endpoint      | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/api/health` | Service health    |

Authenticated requests use a bearer token:

```
Authorization: Bearer <token>
```

---

## Scripts

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `npm run install:all` | Install root, server, and client deps        |
| `npm run dev`         | Run server + client concurrently             |
| `npm run dev:server`  | Run the API only                             |
| `npm run dev:client`  | Run the client only                          |
| `npm run seed`        | Seed the database with sample data           |
| `npm run build`       | Build the client for production              |
| `npm start`           | Start the production server                  |

---

## License

MIT
