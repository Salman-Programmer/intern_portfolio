# Portfolio Management System

A production-ready, full-stack portfolio manager built with **Next.js 15**, **Better Auth**, and **MongoDB**. Users can register, manage their skills and projects, upload a profile picture, and publish a public portfolio page at a shareable URL.

**Live App:** _add your deployed Vercel URL here_
**Public Demo Portfolio:** _add a `/p/<slug>` link here once you've filled in your profile_

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Folder Structure](#folder-structure)
- [Installation Guide](#installation-guide)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Testing Checklist](#testing-checklist)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, API Routes) |
| Auth | Better Auth v1 (email/password, cookie sessions) |
| Database | MongoDB Atlas + Mongoose ODM |
| Styling | Tailwind CSS v3 |
| UI Icons | Lucide React |
| Notifications | React Hot Toast |
| Language | TypeScript |
| Hosting | Vercel (frontend + serverless backend) |

Next.js API Routes serve as the backend, so frontend and backend deploy together as a single Vercel project. MongoDB Atlas is the separately hosted database layer.

---

## Features

### Authentication
- Email/password registration and login (Better Auth)
- 7-day sessions with auto-refresh, secure cookie storage
- Middleware-enforced route protection on `/dashboard/*`
- Change password from the dashboard, with automatic sign-out of other sessions

### Portfolio (Profile)
- Personal info: name, title, bio/about
- Contact details: email, phone, location, website
- Social links: GitHub, LinkedIn, Twitter
- Profile picture upload (JPEG/PNG, 2MB limit)
- Auto-generated, unique public slug (`/p/your-slug`)

### Skills
- Full CRUD
- Category (Frontend, Backend, Database, DevOps, Mobile, Design, Other)
- Proficiency level (Beginner → Expert) and years of experience
- Search and category filter

### Projects
- Full CRUD
- Tech stack tags, category, status (In Progress / Completed / Archived)
- Live URL, repo URL, project image upload
- Featured toggle, start/end dates
- Search plus category/status/tech-stack filters

### Categories
- Custom categories for organizing projects, with color tagging

### Dashboard
- Overview with recent activity feed
- Notification bell with unread count and mark-all-read
- Analytics page
- Live preview of the public portfolio before publishing
- Success/error toasts and skeleton loading states throughout

### Public Portfolio Page
- Publicly accessible, no login required, at `/p/[slug]`
- Renders published skills, projects, and profile info

---

## Folder Structure

```
portfolio-week3/
├── src/
│   ├── app/
│   │   ├── api/                      # Backend (Next.js API Routes)
│   │   │   ├── auth/[...all]/        # Better Auth handler (login/register/session)
│   │   │   ├── portfolio/            # GET/PUT profile info
│   │   │   ├── skills/               # GET/POST skills, [id]/ for PUT/DELETE
│   │   │   ├── projects/             # GET/POST projects, [id]/ for PUT/DELETE
│   │   │   ├── categories/           # GET/POST categories, [id]/ for PUT/DELETE
│   │   │   ├── activities/           # GET recent activity feed
│   │   │   ├── notifications/        # GET notifications, [id]/ mark-read
│   │   │   ├── upload/               # POST profile picture
│   │   │   ├── upload-project/       # POST project image
│   │   │   └── public/[slug]/        # GET public portfolio data (no auth)
│   │   ├── dashboard/                # Authenticated dashboard pages
│   │   │   ├── layout.tsx            # Wraps pages in DashboardShell + session check
│   │   │   ├── page.tsx              # Overview
│   │   │   ├── portfolio/            # Profile, avatar, change password
│   │   │   ├── skills/               # Skills CRUD UI
│   │   │   ├── projects/             # Projects CRUD UI
│   │   │   ├── categories/           # Categories CRUD UI
│   │   │   ├── analytics/            # Analytics UI
│   │   │   └── preview/              # Live preview of public page
│   │   ├── p/[slug]/                 # Public portfolio page (SSR, unauthenticated)
│   │   ├── login/ , register/        # Auth pages
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   └── dashboard/                # DashboardShell (nav/sidebar), NotificationBell
│   ├── lib/
│   │   ├── auth.ts                   # Better Auth server config
│   │   ├── auth-client.ts            # Better Auth React client (signIn/signUp/etc.)
│   │   └── db.ts                     # Mongoose connection (cached across invocations)
│   ├── models/                       # Mongoose schemas: Portfolio, Skill, Project,
│   │                                    Category, Activity
│   └── middleware.ts                 # Route protection (redirects based on session cookie)
├── .env.local.example                # Template for required environment variables
├── next.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

**Why two DB clients?** Better Auth uses its own `MongoClient` connection (`src/lib/auth.ts`) because its MongoDB adapter expects a raw driver instance. All application data (portfolios, skills, projects, etc.) uses Mongoose (`src/lib/db.ts`) for schema validation. Both connect to the same `MONGODB_URI` database.

---

## Installation Guide

### Prerequisites
- Node.js 18.18+ (Next.js 15 requirement)
- A MongoDB instance — either local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier is enough)
- npm (comes with Node)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd portfolio-week3
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` — see [Environment Variables](#environment-variables) below for what each value means.

### 3. Start MongoDB (if running locally)

```bash
# Docker (simplest)
docker run -d -p 27017:27017 --name mongo mongo:7

# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

Skip this step if you're using MongoDB Atlas — just point `MONGODB_URI` at your Atlas cluster.

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`, register an account, and you'll land in the dashboard.

### 5. Build for production (optional local check)

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | Full MongoDB connection string, e.g. `mongodb+srv://user:pass@cluster.mongodb.net/portfolio_cms` |
| `BETTER_AUTH_SECRET` | Yes | Random 32+ char secret used to sign sessions. Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Yes | The base URL of the deployed app, e.g. `https://your-app.vercel.app` (use `http://localhost:3000` locally) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as above — exposed to the browser for building absolute links |

**Never commit `.env.local`.** It's already covered by `.gitignore`; only `.env.local.example` (with placeholder values) should be in version control.

---

## API Documentation

All routes are under `/api/*`. Unless noted, routes require an authenticated session (Better Auth cookie) and return `401 Unauthorized` otherwise. `userId` is always inferred from the session — never taken from the request body.

### Auth
| Method | Route | Description |
|---|---|---|
| `*` | `/api/auth/[...all]` | Handled entirely by Better Auth — register, login, logout, `changePassword`, session retrieval |

### Portfolio (Profile)
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/portfolio` | Returns the current user's profile (defaults if none saved yet) |
| `PUT` | `/api/portfolio` | Upserts profile fields; auto-generates a unique `slug` from `name` on first save |

### Skills
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/skills?search=&category=` | List current user's skills, optional name search / category filter |
| `POST` | `/api/skills` | Create a skill (`name` required) |
| `PUT` | `/api/skills/:id` | Update a skill (ownership verified against session user) |
| `DELETE` | `/api/skills/:id` | Delete a skill |

### Projects
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/projects?search=&category=&status=&skill=` | List current user's projects with optional filters |
| `POST` | `/api/projects` | Create a project (`title`, `description` required) |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete a project |

### Categories
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/categories` | List current user's categories |
| `POST` | `/api/categories` | Create a category |
| `PUT` | `/api/categories/:id` | Update a category |
| `DELETE` | `/api/categories/:id` | Delete a category |

### Activity & Notifications
| Method | Route | Description |
|---|---|---|
| `GET` | `/api/activities` | Last 20 activity log entries for the current user |
| `GET` | `/api/notifications` | Last 15 activities plus unread count |
| `PATCH` | `/api/notifications` | Mark all notifications read |
| `PATCH` | `/api/notifications/:id` | Mark a single notification read |

### Uploads
| Method | Route | Description |
|---|---|---|
| `POST` | `/api/upload` | Multipart form, field `avatar`. Image only, ≤2MB. Stores as base64 data URL on the Portfolio document |
| `POST` | `/api/upload-project` | Multipart form for a project image, same constraints |

### Public
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/public/:slug` | None | Returns published profile, skills, and projects for the public portfolio page |

---

## Deployment

This app deploys as **one Vercel project** (frontend + API routes together) plus a **MongoDB Atlas** cluster for the database.

### 1. Database — MongoDB Atlas
1. Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → add a user with a strong password
3. Network Access → add `0.0.0.0/0` (allow from anywhere, required since Vercel's IPs are dynamic)
4. Get your connection string from **Connect → Drivers**, it looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/portfolio_cms`

### 2. Backend + Frontend — Vercel
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo
3. Framework preset: Next.js (auto-detected)
4. Add environment variables in the Vercel project settings:
   - `MONGODB_URI` — your Atlas connection string
   - `BETTER_AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `BETTER_AUTH_URL` — your Vercel production URL, e.g. `https://your-app.vercel.app`
   - `NEXT_PUBLIC_APP_URL` — same value as above
5. Deploy. Vercel builds the Next.js app and deploys API routes as serverless functions automatically — no separate backend service needed.
6. Once live, update `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` again if your final URL differs from the preview URL, then redeploy.

### 3. Verify
- Visit the deployed URL, register a new account
- Confirm dashboard loads, add a skill/project, upload a profile picture
- Visit `/p/your-slug` in an incognito window to confirm the public page works without login

---

## Screenshots

> Add screenshots here before submitting. Suggested set:

| Page | Screenshot |
|---|---|
| Landing page | _add screenshot_ |
| Login / Register | _add screenshot_ |
| Dashboard overview | _add screenshot_ |
| Skills page | _add screenshot_ |
| Projects page (with filters) | _add screenshot_ |
| Profile / change password | _add screenshot_ |
| Public portfolio page | _add screenshot_ |

---

## Testing Checklist

Manual integration test pass — check off before submitting:

- [ ] **Auth** — register, log out, log back in; visiting `/dashboard` while logged out redirects to `/login`; visiting `/login` while logged in redirects to `/dashboard`
- [ ] **CRUD** — create/edit/delete a skill, a project, and a category; confirm each shows a success toast and appears in the activity feed
- [ ] **Dashboard** — overview loads recent activity; notification bell shows unread count and clears on open
- [ ] **Image upload** — upload a profile picture and a project image; confirm oversized/non-image files are rejected with an error toast
- [ ] **Search** — search skills by name, search projects by title/description/tech
- [ ] **Filters** — filter projects by category, status, and tech stack; filter skills by category
- [ ] **Profile management** — update profile fields and save; change password and confirm re-login works with the new password; confirm other sessions are signed out
- [ ] **Public page** — `/p/<slug>` loads with no auth and reflects current profile/skills/projects
- [ ] **Responsive** — dashboard sidebar collapses to a mobile drawer on small screens
"# intern_portfolio" 
